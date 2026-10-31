<?php

namespace App\Http\Exports\Admin;

use App\Models\PaymentTransaction;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminCashReceiptExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(
        protected array $filters = []
    ) {}

    public function query()
    {
        $query = PaymentTransaction::with(['order.user.customer'])
            ->whereNotNull('cash_receipt_status');

        if (! empty($this->filters['date_from'])) {
            $query->where('paid_at', '>=', $this->filters['date_from']);
        }

        if (! empty($this->filters['date_to'])) {
            $query->where('paid_at', '<=', $this->filters['date_to'] . ' 23:59:59');
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

        return $query->orderBy('paid_at', 'desc');
    }

    public function map($payment): array
    {
        $order    = $payment->order;
        $customer = $order?->user?->customer;

        $supplyAmount = $payment->amount / 1.1;
        $vat          = $payment->amount - $supplyAmount;

        return [
            $order?->order_external_number ?? $order?->order_number,
            'income',
            $order?->contact_phone ?? $customer?->contact_phone,
            number_format($supplyAmount, 0, '.', ''),
            number_format($vat, 0, '.', ''),
            number_format($payment->amount, 0, '.', ''),
            $payment->cash_receipt_status,
            $payment->cash_receipt_issued_at?->format('Y-m-d'),
            $payment->receipt_notes,
        ];
    }

    public function headings(): array
    {
        return [
            '주문 코드',           // Order Code
            '발급 용도',           // Issuance Purpose
            '발급 수단 번호',       // Issuance Method Number
            '공급가액',           // Supply Price (Net Amount)
            '부가세',             // VAT
            '총 거래 금액',        // Total Transaction Amount
            '발급 상태',           // Issuance Status
            '발급 일자',           // Issuance Date
            '비고',               // Remarks
        ];
    }
}
