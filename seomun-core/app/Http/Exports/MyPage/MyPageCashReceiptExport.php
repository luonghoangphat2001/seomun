<?php

namespace App\Http\Exports\MyPage;

use App\Models\PaymentTransaction;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MyPageCashReceiptExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(
        protected array $filters = [],
    ) {}

    private const STATUS_DELETED      = 'deleted';

    public function query()
    {
        $query = PaymentTransaction::with(['order.user.customer'])
            ->whereNotNull('cash_receipt_status')
            ->where('cash_receipt_status', '!=', self::STATUS_DELETED);

        if (! empty($this->filters['user_id'])) {
            $query->whereHas('order', fn($q) => $q->where('user_id', $this->filters['user_id']));
        }

        if (! empty($this->filters['date_from'])) {
            $query->where('cash_receipt_issued_at', '>=', $this->filters['date_from']);
        }

        if (! empty($this->filters['date_to'])) {
            $query->where('cash_receipt_issued_at', '<=', $this->filters['date_to'] . ' 23:59:59');
        }

        if (! empty($this->filters['issue_status'])) {
            $query->where('cash_receipt_status', $this->filters['issue_status']);
        }

        if (! empty($this->filters['order_number'])) {
            $query->whereHas('order', fn($q) => $q->where('order_number', 'like', '%' . $this->filters['order_number'] . '%'));
        }

        if (! empty($this->filters['order_code'])) {
            $query->whereHas('order', fn($q) => $q->where('order_external_number', 'like', '%' . $this->filters['order_code'] . '%'));
        }

        if (! empty($this->filters['start_date'])) {
            $query->where('cash_receipt_issued_at', '>=', Carbon::parse($this->filters['start_date'])->startOfDay());
        }

        if (! empty($this->filters['end_date'])) {
            $query->where('cash_receipt_issued_at', '<=', Carbon::parse($this->filters['end_date'])->endOfDay());
        }

        if (! empty($this->filters['months'])) {
            $query->where('cash_receipt_issued_at', '>=', now()->subMonths((int) $this->filters['months']));
        }

        if (! empty($this->filters['years'])) {
            $query->where('cash_receipt_issued_at', '>=', now()->subYears((int) $this->filters['years']));
        }

        return $query->orderBy('cash_receipt_issued_at', 'desc');
    }

    public function map($payment): array
    {
        $order    = $payment->order;
        $customer = $order?->user?->customer;

        $supplyAmount = $payment->amount / 1.1;
        $vat          = $payment->amount - $supplyAmount;
        $deliveryFee  = $order?->delivery_fee ?? 0;
        $discount     = $order?->coupon_discount ?? 0;

        return [
            $payment->cash_receipt_issued_at?->format('Y-m-d'),
            $order?->order_number,
            number_format((float) ($order?->subtotal_amount ?? '0.00'), 0, '.', ''),
            number_format((float) ($order?->shipping_fee ?? '0.00'), 0, '.', ''),
            number_format((float) ($order?->discount_amount ?? '0.00'), 0, '.', ''),
            number_format((float) ($order?->total_amount ?? '0.00'), 0, '.', ''),
            number_format((float) ($order?->subtotal_amount ?? '0.00'), 0, '.', ''),
            number_format((float) ($order?->tax_amount ?? '0.00'), 0, '.', '')
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
