<?php

namespace App\Exports\Admin;

use App\Models\Order;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminOrderExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(protected array $filters = []) {}

    public function query()
    {
        $query = Order::query()->with(['user.customer', 'product']);

        // Basic filters according to FSD: order number, customer, orderer, status, order period
        $searchTerm = Arr::get($this->filters, 'search_term', Arr::get($this->filters, 'search', Arr::get($this->filters, 'keyword')));
        $orderNumber = Arr::get($this->filters, 'order_number');
        $customer = Arr::get($this->filters, 'customer_name', Arr::get($this->filters, 'company_name'));

        if ($searchTerm !== null && $searchTerm !== '') {
            $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $searchTerm) . '%';
            $query->where(function ($q) use ($like) {
                $q->where('orders.order_number', 'like', $like)
                    ->orWhere('orders.company_name', 'like', $like)
                    ->orWhere('orders.product_name', 'like', $like)
                    ->orWhere('orders.contact_name', 'like', $like)
                    ->orWhereHas('user', function ($uq) use ($like) {
                        $uq->where('name', 'like', $like);
                    })
                    ->orWhereHas('user.customer', function ($cq) use ($like) {
                        $cq->where('company_name', 'like', $like);
                    });
            });
            if ($customer) {
                $query->where(function ($q) use ($customer) {
                    $q->where('orders.company_name', 'like', '%' . $customer . '%')
                        ->orWhereHas('user.customer', function ($cq) use ($customer) {
                            $cq->where('company_name', 'like', '%' . $customer . '%');
                        });
                });
            }
        } elseif ($orderNumber && $customer) {
            $query->where('orders.order_number', 'like', '%' . $orderNumber . '%')
                ->where(function ($q) use ($customer) {
                    $q->where('orders.company_name', 'like', '%' . $customer . '%')
                        ->orWhereHas('user.customer', function ($cq) use ($customer) {
                            $cq->where('company_name', 'like', '%' . $customer . '%');
                        });
                });
        } elseif ($orderNumber) {
            $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $orderNumber) . '%';
            $query->where('orders.order_number', 'like', $like);
        } elseif ($customer) {
            $query->where(function ($q) use ($customer) {
                $q->where('orders.company_name', 'like', '%' . $customer . '%')
                    ->orWhereHas('user.customer', function ($cq) use ($customer) {
                        $cq->where('company_name', 'like', '%' . $customer . '%');
                    });
            });
        }

        if ($orderer = Arr::get($this->filters, 'orderer_name')) {
            $query->where('contact_name', 'like', '%' . $orderer . '%');
        }
        if ($status = Arr::get($this->filters, 'status')) {
            $query->where('status', $status);
        }
        if ($from = Arr::get($this->filters, 'order_date_from')) {
            $query->whereDate('placed_at', '>=', $from);
        }
        if ($to = Arr::get($this->filters, 'order_date_to')) {
            $query->whereDate('placed_at', '<=', $to);
        }

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
                    $query->whereIn('orders.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query->orderBy('placed_at', 'desc');
    }

    public function map($order): array
    {
        return [
            $order->order_number,
            $order->company_name ?: ($order->user?->customer?->company_name ?? ''),
            $order->contact_name,
            $order->status,
            $order->total_amount,
            $order->payment_method?->value ?? $order->payment_method,
            $order->placed_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return [
            '주문 번호',       // Order Number
            '고객명',          // Customer Name
            '주문자명',        // Orderer Name
            '주문 상태',       // Status
            '총 금액',         // Total Amount
            '결제 수단',       // Payment Method
            '주문 일자',       // Order Date
        ];
    }
}
