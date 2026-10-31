<?php

namespace App\Http\Exports\MyPage;

use App\Enums\PaymentMethod;
use App\Models\PaymentTransaction;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MyPageDepositStatusExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(
        protected array $filters = []
    ) {}

    public function query()
    {
        $query = PaymentTransaction::with('order:id,order_number,user_id')
            ->whereHas('order', fn($q) => $q->where('user_id', $this->filters['user_id'] ?? null))
            ->where('payment_method', PaymentMethod::VIRTUAL_ACCOUNT->value)
            ->whereIn('status', [
                \App\Enums\PaymentStatus::PAID,
                \App\Enums\PaymentStatus::REFUNDED,
                \App\Enums\PaymentStatus::PARTIALLY_REFUNDED,
            ])
            ->orderBy('paid_at', 'desc');

        if (! empty($this->filters['start_date'])) {
            $query->where('paid_at', '>=', $this->filters['start_date']);
        }

        if (! empty($this->filters['end_date'])) {
            $query->where('paid_at', '<=', $this->filters['end_date'] . ' 23:59:59');
        }

        if (! empty($this->filters['months'])) {
            $query->where('paid_at', '>=', now()->subMonths((int) $this->filters['months']));
        }

        if (! empty($this->filters['search'])) {
            $query->whereHas(
                'order',
                fn($q) =>
                $q->where('order_number', 'like', '%' . $this->filters['search'] . '%')
            );
        }

        return $query;
    }

    public function map($payment): array
    {
        $order = $payment->order;

        return [
            $payment->id,
            $order?->order_number,
            $payment->payment_method->value,
            number_format((float) ($payment->amount ?? '0.00'), 0, '.', ''),
            $payment->bank_account_holder,
            $payment->paid_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return [
            '발행일',        // Issue date
            '승인번호',      // Approval number
            '주문금액',      // Order cost
            '배송비',        // Delivery fee
            '할인금액',      // Discount amount
            '총금액',        // Total amount
            '공급가액',      // Supply price
            '부가세',        // Surtax (VAT)
        ];
    }
}
