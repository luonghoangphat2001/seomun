<?php

namespace App\Http\Exports\Admin;

use App\Enums\DeliveryStatus;
use App\Helpers\ExportLocaleHelper;
use App\Models\DeliveryTracking;
use App\Services\Admin\AdminDeliveryTrackingService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminDeliveryTrackingExport implements FromQuery, WithHeadings, WithMapping, WithTitle
{
    protected array $filters;

    protected string $locale;

    protected AdminDeliveryTrackingService $adminDeliveryTrackingService;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->locale = Arr::get($filters, 'locale', 'en');
        $this->adminDeliveryTrackingService = app(AdminDeliveryTrackingService::class);
    }

    public function query()
    {
        $query = $this->adminDeliveryTrackingService->buildQuery($this->filters);
        $exportType = Arr::get($this->filters, 'export_type', 'ALL');

        // Match sort by
        $sortBy = Arr::get($this->filters, 'sort_by', 'waybill_registered_at');
        $sortOrder = Arr::get($this->filters, 'sort_order', 'desc');
        $sortColumn = match ($sortBy) {
            'invoice_number' => 'delivery_trackings.invoice_number',
            'delivery_status' => 'delivery_trackings.delivery_status',
            default => 'delivery_trackings.waybill_registered_at',
        };
        $query->orderBy($sortColumn, $sortOrder);

        switch ($exportType) {
            case 'ALL':
                break;
            case 'CURRENT_PAGE':
                $currentPage = (int) Arr::get($this->filters, 'current_page', 1);
                $perPage = (int) Arr::get($this->filters, 'per_page', 20);

                $trackingId = $query->select('delivery_trackings.*')
                    ->offset(($currentPage - 1) * $perPage)
                    ->limit($perPage)
                    ->pluck('id');

                return DeliveryTracking::query()
                    ->with(['order.items', 'order.product'])
                    ->whereIn('id', $trackingId);
                break;
            case 'SELECTED':
                $selectedIds = Arr::get($this->filters, 'selected_ids', []);
                if ($selectedIds !== []) {
                    $query->whereIn('delivery_trackings.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    /**
     * @param  DeliveryTracking  $row
     */
    public function map($row): array
    {
        $order = $row->order;
        $quantity = $order?->items?->sum('quantity') ?? 0;

        $deliveryStatusLabels = [
            'en' => [
                DeliveryStatus::Pickup->value => 'Pickup',
                DeliveryStatus::InTransit->value => 'In transit',
                DeliveryStatus::Delivered->value => 'Delivered',
            ],
            'ko' => [
                DeliveryStatus::Pickup->value => '픽업',
                DeliveryStatus::InTransit->value => '배송중',
                DeliveryStatus::Delivered->value => '배송완료',
            ],
            'ja' => [
                DeliveryStatus::Pickup->value => 'ピックアップ',
                DeliveryStatus::InTransit->value => '配送中',
                DeliveryStatus::Delivered->value => '配達完了',
            ],
        ];
        $deliveryStatus = $row->delivery_status
            ? ($deliveryStatusLabels[$this->locale][$row->delivery_status->value] ?? $row->delivery_status->label())
            : '';

        return [
            $row->id,
            $order?->order_number,
            $order?->company_name,
            $order?->product_name,
            (int) $quantity,
            $row->invoice_number,
            $row->waybill_registered_at?->format('Y-m-d'),
            $deliveryStatus,
            $row->courier_name,
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getDeliveryTrackingHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getDeliveryTrackingSheetName($this->locale);
    }
}
