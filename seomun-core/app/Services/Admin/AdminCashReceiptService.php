<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\PaginationService;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminCashReceiptService
{
    public function __construct(
        protected PaginationService $paginationService,
    ) {}

    public function getList(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = PaymentTransaction::with(['order.user.customer'])
            ->whereNotNull('cash_receipt_status');

        if (! empty($filters['date_from'])) {
            $query->where('paid_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->where('paid_at', '<=', $filters['date_to'].' 23:59:59');
        }

        if (! empty($filters['issue_status'])) {
            $query->where('cash_receipt_status', $filters['issue_status']);
        }

        if (! empty($filters['order_number'])) {
            $query->whereHas('order', fn ($q) => $q->where('order_number', 'like', '%'.$filters['order_number'].'%'));
        }

        if (! empty($filters['order_code'])) {
            $query->whereHas('order', fn ($q) => $q->where('order_external_number', 'like', '%'.$filters['order_code'].'%'));
        }

        return $query->orderBy('paid_at', 'desc')->paginate($perPage);
    }

    public function create(array $data): PaymentTransaction
    {
        $order = Order::with(['paymentTransaction', 'user.customer'])->findOrFail($data['order_id']);

        $transaction = $order->paymentTransaction->first();
        if (! $transaction) {
            throw new \RuntimeException('No payment transaction found for this order.');
        }

        if ($transaction->cash_receipt_status !== null) {
            throw new \RuntimeException('Cash receipt already exists for this order.');
        }

        $transaction->update([
            'cash_receipt_status' => 'pending',
            'receipt_notes'       => $data['notes'] ?? null,
        ]);

        return $transaction->fresh(['order.user.customer']);
    }

    public function issue(int $id): PaymentTransaction
    {
        $transaction = PaymentTransaction::findOrFail($id);
        $transaction->update([
            'cash_receipt_status' => 'issued',
            'cash_receipt_issued_at' => now(),
        ]);

        return $transaction->fresh();
    }

    public function delete(int $id): void
    {
        $transaction = PaymentTransaction::findOrFail($id);
        $transaction->update(['cash_receipt_status' => 'deleted']);
    }

    public function setPending(int $id): PaymentTransaction
    {
        $transaction = PaymentTransaction::findOrFail($id);
        $transaction->update([
            'cash_receipt_status' => 'pending',
            'cash_receipt_issued_at' => null,
        ]);

        return $transaction->fresh();
    }

    public function bulkUpdateStatus(array $ids, string $status): int
    {
        $data = ['cash_receipt_status' => $status];

        if ($status === 'issued') {
            $data['cash_receipt_issued_at'] = now();
        } elseif ($status === 'pending') {
            $data['cash_receipt_issued_at'] = null;
        }

        return PaymentTransaction::whereIn('id', $ids)
            ->whereNotNull('cash_receipt_status')
            ->update($data);
    }

    public function bulkGenerate(array $orderIds, ?string $notes = null): array
    {
        $results = ['created' => [], 'skipped' => []];

        $orders = Order::with(['paymentTransaction'])->whereIn('id', $orderIds)->get();

        foreach ($orders as $order) {
            $transaction = $order->paymentTransaction->first();

            if (! $transaction) {
                $results['skipped'][] = ['order_id' => $order->id, 'reason' => 'No payment transaction'];
                continue;
            }

            if ($transaction->cash_receipt_status !== null) {
                $results['skipped'][] = ['order_id' => $order->id, 'reason' => 'Cash receipt already exists'];
                continue;
            }

            $transaction->update([
                'cash_receipt_status' => 'pending',
                'receipt_notes'       => $notes,
            ]);

            $results['created'][] = $transaction->fresh(['order.user.customer']);
        }

        return $results;
    }
}
