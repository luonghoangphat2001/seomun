<?php

namespace App\Services\Admin;

use App\Enums\DeliveryStatus;
use App\Models\DeliveryTracking;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;

class AdminDeliveryTrackingService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        return [
            'delivery_status_options' => DeliveryStatus::options(),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function getDeliveryTrackings(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);
        $sortBy = Arr::get($filters, 'sort_by', 'waybill_registered_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');
        $sortColumn = match ($sortBy) {
            'invoice_number' => 'delivery_trackings.invoice_number',
            'delivery_status' => 'delivery_trackings.delivery_status',
            default => 'delivery_trackings.waybill_registered_at',
        };
        $query->orderBy($sortColumn, $sortOrder);
        $currentPage = (int) Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['delivery_trackings.*'], 'page', $currentPage);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function buildQuery(array $filters): Builder
    {
        $query = DeliveryTracking::query()
            ->select('delivery_trackings.*')
            ->join('orders', 'delivery_trackings.order_id', '=', 'orders.id')
            ->with(['order.items', 'order.product']);

        $searchTerm = Arr::get($filters, 'search_term');
        if ($searchTerm !== null && $searchTerm !== '') {
            $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $searchTerm).'%';
            $query->where(function (Builder $q) use ($like) {
                $q->where('delivery_trackings.invoice_number', 'like', $like)
                    ->orWhere('orders.order_number', 'like', $like)
                    ->orWhere('orders.company_name', 'like', $like)
                    ->orWhere('orders.product_name', 'like', $like);
            });
        }

        $invoiceNumber = Arr::get($filters, 'invoice_number');
        if ($invoiceNumber) {
            $query->where('delivery_trackings.invoice_number', 'like', '%'.$invoiceNumber.'%');
        }
        $orderNumber = Arr::get($filters, 'order_number');
        if ($orderNumber) {
            $query->where('orders.order_number', 'like', '%'.$orderNumber.'%');
        }
        $customerName = Arr::get($filters, 'customer_name');
        if ($customerName) {
            $query->where('orders.company_name', 'like', '%'.$customerName.'%');
        }
        $productName = Arr::get($filters, 'product_name');
        if ($productName) {
            $query->where('orders.product_name', 'like', '%'.$productName.'%');
        }
        $deliveryStatus = Arr::get($filters, 'delivery_status');
        if ($deliveryStatus !== null && $deliveryStatus !== '') {
            $query->where('delivery_trackings.delivery_status', $deliveryStatus);
        }
        $from = Arr::get($filters, 'waybill_registration_date_from');
        if ($from) {
            $query->where('delivery_trackings.waybill_registered_at', '>=', $from);
        }
        $to = Arr::get($filters, 'waybill_registration_date_to');
        if ($to) {
            $query->where('delivery_trackings.waybill_registered_at', '<=', $to);
        }

        return $query;
    }

    public function getByInvoiceNumber(string $invoiceNumber): ?DeliveryTracking
    {
        return DeliveryTracking::query()
            ->where('invoice_number', $invoiceNumber)
            ->with(['order.items', 'order.product'])
            ->first();
    }
}
