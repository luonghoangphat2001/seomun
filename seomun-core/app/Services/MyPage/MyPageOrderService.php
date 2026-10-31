<?php

namespace App\Services\MyPage;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class MyPageOrderService
{
    /**
     * Get order-delivery-tracking list for MyPage screen.
     */
    public function getOrders(User $user, array $filters = []): LengthAwarePaginator
    {
        try {
            $query = Order::with([
                'items.artworks',
                'items.designGroup.uploadArtworks',
                'items.designGroup.orderArtworks',
                'items.designWorkflow',
                'review',
                'product',
                'deliveryTracking',
            ])
                ->where('user_id', $user->id);

            // Filter by status
            if (isset($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            $filterLabel = $filters['filter_label'] ?? 'all';

            // Exclude cancelled orders (design filter: 취소 제외)
            if ($filterLabel === 'exclude_cancelled') {
                $query->where('status', '!=', OrderStatus::Cancelled->value);
            }

            // File error only (design filter: 파일에러)
            if ($filterLabel === 'file_error') {
                // $query->where('metadata->proof_status', 'file_error');
                $query->where('status', OrderStatus::FileError->value);
            }

            // Product scope (상품전체 by default)
            if (($filters['product_scope'] ?? 'all') !== 'all') {
                $query->where('metadata->product_scope', $filters['product_scope']);
            }

            if (! empty($filters['order_number_keyword'])) {
                $orderNumberKeyword = $filters['order_number_keyword'];
                $query->where(function ($q) use ($orderNumberKeyword) {
                    $q->where('order_number', 'like', "%{$orderNumberKeyword}%")
                        ->orWhere('order_external_number', 'like', "%{$orderNumberKeyword}%");
                });
            }

            if (! empty($filters['product_name_keyword'])) {
                $productKeyword = $filters['product_name_keyword'];
                $query->where('product_name', 'like', "%{$productKeyword}%");
            }

            // Filter by date range
            $dateFrom = $filters['date_from'] ?? null;
            $dateTo = $filters['date_to'] ?? null;

            // If date range is not set, use quick period (1w/1m/3m/6m)
            if ((! $dateFrom || ! $dateTo) && ! empty($filters['period'])) {
                $now = now();
                $dateTo = $dateTo ?: $now->toDateString();
                $dateFrom = match ($filters['period']) {
                    '1w' => $now->copy()->subWeek()->toDateString(),
                    '1m' => $now->copy()->subMonth()->toDateString(),
                    '3m' => $now->copy()->subMonths(3)->toDateString(),
                    '6m' => $now->copy()->subMonths(6)->toDateString(),
                    default => $dateFrom,
                };
            }

            if (! empty($dateFrom)) {
                $query->whereDate('created_at', '>=', $dateFrom);
            }
            if (! empty($dateTo)) {
                $query->whereDate('created_at', '<=', $dateTo);
            }

            // Sort
            $sortBy = $filters['sort_by'] ?? 'created_at';
            $sortOrder = $filters['sort_order'] ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            $perPage = $filters['per_page'] ?? 10;
            $perPage = min($perPage, 100); // Max 100 per page

            return $query->paginate($perPage);
        } catch (\Exception $e) {
            Log::error('Get MyPage orders failed', [
                'user_id' => $user->id,
                'filters' => $filters,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get order detail for MyPage order-delivery-tracking screen.
     */
    public function getOrderDetail(User $user, string $orderNumber): Order
    {
        try {
            $order = Order::with([
                'user.customer',
                'items.artworks',
                'items.designGroup.uploadArtworks',
                'items.designGroup.orderArtworks',
                'items.designWorkflow',
                'paymentTransaction',
                'orderShipments.items',
                'deliveryTracking',
                'artworks',
                'latestShippingAddressHistory',
                'reviews'
            ])
                ->withCount('shippingAddressHistories')
                ->where('user_id', $user->id)
                ->where('order_number', $orderNumber)
                ->first();

            if (! $order) {
                throw new ModelNotFoundException('주문을 찾을 수 없습니다.');
            }

            return $order;
        } catch (\Exception $e) {
            Log::error('Get MyPage order detail failed', [
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
