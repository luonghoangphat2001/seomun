<?php

namespace App\Services\MyPage;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class MyPagePaymentService
{
    /**
     * Get payment progress list for a specific order of the current user.
     */
    public function getOrderPaymentProgress(User $user, string $orderNumber): array
    {
        $order = Order::where('user_id', $user->id)
            ->where('order_number', $orderNumber)
            ->first();

        if (! $order) {
            return [];
        }

        if (! $this->isPaymentCompletedStage($order)) {
            return [];
        }

        $transactions = PaymentTransaction::where('order_id', $order->id)
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        $payerName = $order->contact_name ?: $user->name;

        return $transactions->values()->map(function (PaymentTransaction $transaction, int $index) use ($payerName) {
            $status = $transaction->getPaymentStatusEnum();
            $isPending = $status?->isPending() ?? false;
            $statusValue = $status?->value ?? (string) $transaction->status;

            return [
                'sequence' => $index + 1,
                'transaction_id' => $transaction->transaction_id,
                'payer_name' => $payerName,
                'payment_status' => $statusValue,
                'payment_status_label' => $isPending ? '결제 대기' : ($status?->label() ?? $statusValue),
                'paid_at' => $transaction->paid_at?->toIso8601String(),
                'can_pay' => $isPending,
            ];
        })->all();
    }

    private function isPaymentCompletedStage(Order $order): bool
    {
        $status = $order->status ? OrderStatus::tryFrom($order->status) : null;

        if (! $status) {
            $paymentStatus = $order->payment_status ? PaymentStatus::tryFrom($order->payment_status) : null;

            return $paymentStatus?->isCompleted() ?? false;
        }

        return in_array($status, [
            OrderStatus::Draft,
            OrderStatus::Pending,
            OrderStatus::AwaitingPayment,
            OrderStatus::Cancelled,
            OrderStatus::RefundRequested,
            OrderStatus::RefundCompleted,
        ], true);
    }

    /**
     * Get pending/processing payments for a user
     */
    public function getPendingPayments(User $user, array $filters): LengthAwarePaginator
    {
        $perPage = $filters['per_page'] ?? config('app.paginate.per_page');

        return PaymentTransaction::with(['order' => function ($query) {
            $query->with('items');
        }])
            ->whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->whereIn('status', [
                PaymentStatus::PENDING->value,
                PaymentStatus::PROCESSING->value,
            ])
            ->filters($filters)
            ->paginate($perPage);
    }

    /**
     * Get completed payments for a user
     */
    public function getCompletedPayments(User $user, array $filters = []): LengthAwarePaginator
    {
        $perPage = $filters['per_page'] ?? config('app.paginate.per_page');

        return PaymentTransaction::with(['order' => function ($query) {
            $query->with('items');
        }])
            ->whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->whereIn('status', [
                PaymentStatus::PAID->value,
                PaymentStatus::REFUNDED->value,
                PaymentStatus::PARTIALLY_REFUNDED->value,
            ])
            ->filters($filters)
            ->paginate($perPage);
    }

    /**
     * Get failed/cancelled payments for a user
     */
    public function getFailedPayments(User $user, array $filters = []): LengthAwarePaginator
    {
        $perPage = $filters['per_page'] ?? config('app.paginate.per_page');

        return PaymentTransaction::with(['order' => function ($query) {
            $query->with('items');
        }])
            ->whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->whereIn('status', [
                PaymentStatus::FAILED->value,
                PaymentStatus::CANCELLED->value,
                PaymentStatus::EXPIRED->value,
            ])
            ->filters($filters)
            ->paginate($perPage);
    }

    /**
     * Get all payments for a user (both pending and completed)
     */
    public function getAllPayments(User $user, array $filters): LengthAwarePaginator
    {
        $perPage = $filters['per_page'] ?? config('app.paginate.per_page');

        return PaymentTransaction::with(['order' => function ($query) {
            $query->with('items');
        }])
            ->whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->filters($filters)
            ->paginate($perPage);
    }

    /**
     * Get a single payment transaction detail for a user
     */
    public function getPaymentDetail(User $user, string $transactionId): ?PaymentTransaction
    {
        return PaymentTransaction::with(['order' => function ($query) {
            $query->with('items');
        }])
            ->whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('transaction_id', $transactionId)
            ->first();
    }

    /**
     * Bulk approve payments
     */
    public function bulkApprovePayments(User $user, array $transactionIds): int
    {
        $this->guardBankTransfers($user, $transactionIds);
        return \DB::transaction(function () use ($user, $transactionIds) {
            $count = PaymentTransaction::whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->whereIn('transaction_id', $transactionIds)
                ->whereIn('status', [PaymentStatus::PENDING->value, PaymentStatus::PROCESSING->value])
                ->update([
                    'status' => PaymentStatus::PAID->value,
                    'paid_at' => now(),
                ]);

            // Update order payment statuses only for affected transactions
            $orderIds = PaymentTransaction::whereIn('transaction_id', $transactionIds)
                ->whereHas('order', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->where('status', PaymentStatus::PAID->value)
                ->pluck('order_id')
                ->toArray();

            if (! empty($orderIds)) {
                Order::whereIn('id', $orderIds)
                    ->where('user_id', $user->id)
                    ->update([
                        'payment_status' => PaymentStatus::PAID->value,
                    ]);
            }

            return $count;
        });
    }

    /**
     * Bulk reject payments
     */
    public function bulkRejectPayments(User $user, array $transactionIds, ?string $reason = null): int
    {
        // Bank-transfer cancellation must use the per-payment endpoint's row locks.
        $this->guardBankTransfers($user, $transactionIds);
        return \DB::transaction(function () use ($user, $transactionIds, $reason) {
            $count = PaymentTransaction::whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->whereIn('transaction_id', $transactionIds)
                ->whereIn('status', [PaymentStatus::PENDING->value, PaymentStatus::PROCESSING->value])
                ->update([
                    'status' => PaymentStatus::CANCELLED->value,
                    'refund_reason' => $reason,
                    'failed_at' => now(),
                ]);

            // Update order payment statuses only for affected transactions
            $orderIds = PaymentTransaction::whereIn('transaction_id', $transactionIds)
                ->whereHas('order', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->where('status', PaymentStatus::CANCELLED->value)
                ->pluck('order_id')
                ->toArray();

            if (! empty($orderIds)) {
                Order::whereIn('id', $orderIds)
                    ->where('user_id', $user->id)
                    ->update([
                        'payment_status' => PaymentStatus::CANCELLED->value,
                    ]);
            }

            return $count;
        });
    }

    private function guardBankTransfers(User $user, array $transactionIds): void
    {
        if (config('popbill.enabled') && PaymentTransaction::whereIn('transaction_id', $transactionIds)
            ->where('payment_method', 'bank_transfer')
            ->whereHas('order', fn ($query) => $query->where('user_id', $user->id))->exists()) {
            throw new \Exception('계좌이체는 은행 입금 확인 또는 개별 결제 취소를 이용해 주세요.', 403);
        }
    }
}
