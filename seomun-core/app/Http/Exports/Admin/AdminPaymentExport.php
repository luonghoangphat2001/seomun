<?php

namespace App\Http\Exports\Admin;

use App\Models\PaymentTransaction;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Database\Eloquent\Collection;

class AdminPaymentExport implements FromCollection, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(protected array $filters = []) {}

    public function collection(): Collection
    {
        $query = PaymentTransaction::with('order')->filters($this->filters);
        $exportType = Arr::get($this->filters, 'export_type', 'ALL');

        switch ($exportType) {
            case 'ALL':
                break;
            case 'CURRENT_PAGE':
                $currentPage = (int) Arr::get($this->filters, 'current_page', 1);
                $perPage = (int) Arr::get($this->filters, 'per_page', 20);
                $query->offset(($currentPage - 1) * $perPage)->limit($perPage);
                break;
            case 'SELECTED':
                $selectedIds = Arr::get($this->filters, 'selected_ids', []);
                if ($selectedIds !== []) {
                    // selected_ids contains payment transaction_ids (string identifiers)
                    $query->whereIn('payment_transactions.transaction_id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query->get();
    }

    public function map($payment): array
    {
        return [
            $payment->order->order_number,
            $payment->order->name,
            $payment->payment_method?->value ?? $payment->payment_method,
            $payment->amount,
            $payment->status?->value ?? $payment->status,
            $payment->created_at->format('Y-m-d H:i:s'),
            $payment->pg_transaction_id,
        ];
    }

    public function headings(): array
    {
        return [
            '주문 번호',           // Order Number
            '고객명',              // Customer Name
            '결제 수단',           // Payment Method
            '금액',                // Amount
            '상태',                // Status
            '결제 일자',           // Payment Date
            'PG 거래 ID',          // PG Transaction ID
        ];
    }
}
