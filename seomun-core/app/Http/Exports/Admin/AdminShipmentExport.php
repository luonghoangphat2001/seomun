<?php

namespace App\Http\Exports\Admin;

use App\Helpers\ExportLocaleHelper;
use App\Models\OrderShipment;
use App\Services\Admin\AdminShipmentService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminShipmentExport implements FromQuery, WithHeadings, WithMapping, WithTitle
{
    protected array $filters;

    protected string $locale;

    protected AdminShipmentService $adminShipmentService;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->locale = Arr::get($filters, 'locale', 'en');
        $this->adminShipmentService = app(AdminShipmentService::class);
    }

    public function query()
    {
        $query = $this->adminShipmentService->buildQuery($this->filters);
        $exportType = Arr::get($this->filters, 'export_type', 'ALL');

        switch ($exportType) {
            case 'ALL':
                break;
            case 'CURRENT_PAGE':
                $currentPage = (int) Arr::get($this->filters, 'current_page', 1);
                $perPage = (int) Arr::get($this->filters, 'per_page', 20);
                $ids = $query->select('order_shipments.*')
                    ->offset(($currentPage - 1) * $perPage)
                    ->limit($perPage)
                    ->pluck('order_shipments.id');

                return OrderShipment::query()
                    ->with(['order.items.product', 'items.product'])
                    ->whereIn('id', $ids);
            case 'SELECTED':
                $selectedIds = Arr::get($this->filters, 'selected_ids', []);
                if ($selectedIds !== []) {
                    $query->whereIn('order_shipments.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($shipment): array
    {
        $order = $shipment->order;
        $quantity = $shipment->items->sum('quantity');

        $itemNames = $shipment->items
            ->map(fn($i) => $i->product?->name ?? $i->product_name)
            ->filter()
            ->implode(', ');

        return [
            $shipment->id,
            $order?->order_number,
            $order?->company_name,
            $shipment->type?->label($this->locale) ?? $shipment->type?->value,
            $itemNames,
            (int) $quantity,
            $shipment->tracking_number,
            $shipment->carrier_name ?? $shipment->carrier_code,
            $shipment->status?->label($this->locale) ?? $shipment->status?->value,
            $shipment->shipped_at?->format('Y-m-d'),
            $shipment->delivered_at?->format('Y-m-d'),
            $shipment->shipping_fee,
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getShipmentHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getShipmentSheetName($this->locale);
    }
}
