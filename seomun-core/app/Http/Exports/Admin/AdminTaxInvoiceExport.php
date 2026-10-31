<?php

namespace App\Http\Exports\Admin;

use App\Models\PaymentTransaction;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminTaxInvoiceExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(protected array $filters = []) {}

    public function query()
    {
        $query = PaymentTransaction::with(['order.user.customer'])
            ->whereNotNull('tax_invoice_status');

        if (! empty($this->filters['date_from'])) {
            $query->where('paid_at', '>=', $this->filters['date_from']);
        }

        if (! empty($this->filters['date_to'])) {
            $query->where('paid_at', '<=', $this->filters['date_to'].' 23:59:59');
        }

        if (! empty($this->filters['issue_status'])) {
            $query->where('tax_invoice_status', $this->filters['issue_status']);
        }

        if (! empty($this->filters['order_number'])) {
            $query->whereHas('order', fn ($q) => $q->where('order_number', 'like', '%'.$this->filters['order_number'].'%'));
        }

        if (! empty($this->filters['order_code'])) {
            $query->whereHas('order', fn ($q) => $q->where('order_external_number', 'like', '%'.$this->filters['order_code'].'%'));
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
            'tax_invoice',
            $payment->paid_at?->format('Y-m-d'),
            $customer?->business_registration_number,
            $customer?->company_name ?? $order?->company_name,
            $customer?->representative_name,
            $customer?->address,
            $customer?->business_type,
            $customer?->industry_type,
            $customer?->tax_invoice_email ?? $customer?->contact_email,
            number_format($supplyAmount, 0, '.', ''),
            number_format($vat, 0, '.', ''),
            number_format($payment->amount, 0, '.', ''),
            $payment->tax_invoice_status,
            $payment->receipt_notes,
        ];
    }

    public function headings(): array
    {
        return [
            '주문 코드',           // Order Code
            '유형',               // Type
            '작성 일자',           // Date of Creation
            '사업자등록번호',       // Business Registration Number
            '상호명',              // Company Name
            '대표자명',            // Representative
            '사업장 소재지',       // Business Address
            '업태',               // Business Type
            '종목',               // Industry
            '이메일',              // Email
            '공급가액',           // Supply Price
            '부가세',             // VAT
            '결제 금액',           // Payment Amount
            '상태',                // Status
            '비고',               // Notes
        ];
    }
}
