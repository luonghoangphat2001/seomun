<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Approval;
use App\Models\ApprovalItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderApprovalService
{
    private const STATUS_PENDING = 'pending';

    private const STATUS_REJECTED = 'rejected';

    private const STATUS_CANCELLED = 'cancelled';

    /**
     * @throws \Throwable
     */
    public function cancel(string $orderNumber, User $approver, string $cancelReason): void
    {
        DB::transaction(function () use ($orderNumber, $approver, $cancelReason) {
            $order = Order::where('order_number', $orderNumber)
                ->lockForUpdate()
                ->firstOrFail();

            $approval = Approval::where('approvable_type', Order::class)
                ->where('approvable_id', $order->id)
                ->lockForUpdate()
                ->first();

            if (! $approval || ! $approval->isPending()) {
                throw new \InvalidArgumentException('결재 진행 중인 주문이 아닙니다.');
            }

            $item = ApprovalItem::where('approval_id', $approval->id)
                ->where('stage', $approval->current_stage)
                ->where('approver_id', $approver->id)
                ->where('status', self::STATUS_PENDING)
                ->lockForUpdate()
                ->first();

            if (! $item) {
                throw new \InvalidArgumentException('해당 단계의 결재 권한이 없습니다.');
            }

            $item->update([
                'status' => self::STATUS_REJECTED,
                'comment' => $cancelReason,
                'rejected_at' => now(),
            ]);

            $approval->update([
                'status' => self::STATUS_CANCELLED,
                'reject_reason' => $cancelReason,
                'rejected_at' => now(),
            ]);

            $order->update([
                'status' => OrderStatus::Cancelled->value,
            ]);

            $this->markPaidPaymentAsRefunded($order, $cancelReason);
        });
    }

    /**
     * Mark an already-paid order as refunded after approval cancellation.
     * The external payment gateway refund is handled outside this method.
     */
    private function markPaidPaymentAsRefunded(Order $order, string $reason): void
    {
        if ($order->payment_status !== PaymentStatus::PAID->value) {
            return;
        }

        $paidTransaction = $order->paymentTransaction()
            ->where('status', PaymentStatus::PAID->value)
            ->latest('id')
            ->lockForUpdate()
            ->first();

        if (! $paidTransaction) {
            return;
        }

        $paidTransaction->update([
            'status' => PaymentStatus::REFUNDED->value,
            'refund_reason' => $reason,
            'refunded_at' => now(),
        ]);

        $order->update([
            'payment_status' => PaymentStatus::REFUNDED->value,
        ]);
    }
}
