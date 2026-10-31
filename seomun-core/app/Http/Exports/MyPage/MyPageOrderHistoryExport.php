<?php

namespace App\Http\Exports\MyPage;

use App\Helpers\DateHelper;
use App\Models\Order;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MyPageOrderHistoryExport implements FromCollection, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(protected array $filters = []) {}

    public function collection()
    {
        $query = Order::with(['items', 'product', 'deliveryTracking'])
            ->where('user_id', $this->filters['user_id'] ?? null)
            ->orderBy($this->filters['sort_by'] ?? 'created_at', $this->filters['sort_order'] ?? 'desc');

        if (isset($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        $filterLabel = $this->filters['filter_label'] ?? 'all';
        if ($filterLabel === 'exclude_cancelled') {
            $query->where('status', '!=', \App\Enums\OrderStatus::Cancelled->value);
        }

        if ($filterLabel === 'file_error') {
            $query->where('metadata->proof_status', 'file_error');
        }

        if (($this->filters['product_scope'] ?? 'all') !== 'all') {
            $query->where('metadata->product_scope', $this->filters['product_scope']);
        }

        if (! empty($this->filters['order_number_keyword'])) {
            $keyword = $this->filters['order_number_keyword'];
            $query->where(function ($q) use ($keyword) {
                $q->where('order_number', 'like', "%{$keyword}%")
                    ->orWhere('order_external_number', 'like', "%{$keyword}%");
            });
        }

        if (! empty($this->filters['product_name_keyword'])) {
            $query->where('product_name', 'like', "%{$this->filters['product_name_keyword']}%");
        }

        if (! empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }
        if (! empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        $orders = $query->get();

        return $orders->flatMap(function ($order) {
            return $order->items->map(function ($item) use ($order) {
                return (object) [
                    'order' => $order,
                    'item' => $item,
                ];
            });
        });
    }

    public function map($data): array
    {
        $order = $data->order;
        $item = $data->item;

        $optionsString = '';
        if (isset($item->configuration['options'])) {
            $optionsString = collect($item->configuration['options'])->map(function ($opt) {
                return ($opt['group']['name'] ?? '') . ': ' . ($opt['option']['label'] ?? '');
            })->implode(', ');
        }

        return [
            $order->order_number,
            $item->title,
            $optionsString,
            (int) ($item->quantity ?? 0),
            (int) ($item->multiplier ?? 1),
            number_format((float) ($item->total_price ?? 0), 0, '.', ''),
            $order->status,
            DateHelper::toKorea($order->created_at),
        ];
    }

    public function headings(): array
    {
        return [
            '주문번호',      // Order Number
            '상품명',        // Product Name
            '옵션',          // Options
            '수량',          // Quantity
            '건수',          // Case
            '금액',          // Amount
            '상태',          // Status
            '주문일시',      // Ordered At
        ];
    }
}
