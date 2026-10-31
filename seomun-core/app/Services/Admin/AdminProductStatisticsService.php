<?php

namespace App\Services\Admin;

use App\Models\Customer;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminProductStatisticsService
{
    /**
     * @var ProductRepositoryInterface
     */
    protected $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    /**
     * Get sales volume by product
     */
    public function getSalesVolumeByProduct(array $filters = []): array
    {
        $query = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->select(
                'products.id as product_id',
                'products.name',
                'products.name_en',
                'products.name_ja',
                'products.is_active',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_revenue')
            )
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('products.id', 'products.name', 'products.name_en', 'products.name_ja', 'products.is_active')
            ->orderByDesc('total_quantity');

        $this->applyDateFilters($query, $filters);
        $this->applyCustomerFilters($query, $filters);

        $results = $query->get();

        return $results->map(function ($item) {
            return [
                'product_id' => $item->product_id,
                'name' => $item->name,
                'name_en' => $item->name_en,
                'name_ja' => $item->name_ja,
                'is_active' => $item->is_active,
                'total_quantity' => (int) $item->total_quantity,
                'total_revenue' => (float) $item->total_revenue,
                'unit' => 'count',
            ];
        })->toArray();
    }

    /**
     * Get top N sales products
     */
    public function getTopNSalesProducts(int $limit = 10, array $filters = []): array
    {
        $query = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->select(
                'products.id as product_id',
                'products.name',
                'products.name_en',
                'products.name_ja',
                'products.is_active',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_revenue')
            )
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('products.id', 'products.name', 'products.name_en', 'products.name_ja', 'products.is_active')
            ->orderByDesc('total_quantity')
            ->limit($limit);

        $this->applyDateFilters($query, $filters);
        $this->applyCustomerFilters($query, $filters);

        $results = $query->get();

        // Add rank to each product
        return $results->map(function ($item, $index) {
            return [
                'product_id' => $item->product_id,
                'name' => $item->name,
                'name_en' => $item->name_en,
                'name_ja' => $item->name_ja,
                'is_active' => $item->is_active,
                'total_quantity' => (int) $item->total_quantity,
                'total_revenue' => (float) $item->total_revenue,
                'unit' => 'count',
                'rank' => $index + 1,
            ];
        })->toArray();
    }

    /**
     * Get promoted products click-through rate
     */
    public function getPromotedProductsCTR(array $filters = []): array
    {
        $query = DB::table('customer_promotional_products')
            ->join('products', 'customer_promotional_products.product_id', '=', 'products.id')
            ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
            ->leftJoin('orders', 'order_items.order_id', '=', 'orders.id')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->select(
                'products.id as product_id',
                'products.name',
                'products.name_en',
                'products.name_ja',
                'products.is_active',
                'products.view_count',
                'products.exposure_count',
                DB::raw('COUNT(DISTINCT orders.id) as click_count')
            )
            ->where('products.exposure_count', '>', 0)
            // Link orders to the same customer as the promotional product
            ->where(function ($q) {
                $q->whereNull('orders.id') // Include products with no orders
                    ->orWhereColumn('customer_promotional_products.customer_id', 'users.customer_id'); // Orders must belong to the same customer
            })
            ->groupBy('products.id', 'products.name', 'products.name_en', 'products.name_ja', 'products.is_active', 'products.view_count', 'products.exposure_count')
            ->orderByDesc('exposure_count');

        $this->applyDateFilters($query, $filters);
        $this->applyCustomerFilters($query, $filters);

        $results = $query->get();

        return $results->map(function ($item) {
            $ctr = $item->exposure_count > 0 ? ($item->click_count / $item->exposure_count) * 100 : 0;

            return [
                'product_id' => $item->product_id,
                'name' => $item->name,
                'name_en' => $item->name_en,
                'name_ja' => $item->name_ja,
                'is_active' => $item->is_active,
                'view_count' => (int) $item->view_count,
                'exposure_count' => (int) $item->exposure_count,
                'click_count' => (int) $item->click_count,
                'ctr' => round($ctr, 2),
                'unit' => 'percent',
            ];
        })->toArray();
    }

    /**
     * Get product statistics by status
     */
    public function getStatisticsByStatus(array $filters = []): array
    {
        $soldQuery = $this->getStatusStatisticsQuery(true, $filters);
        $hiddenQuery = $this->getStatusStatisticsQuery(false, $filters);

        return [
            'sold' => $soldQuery,
            'hidden' => $hiddenQuery,
        ];
    }

    /**
     * Get statistics for a specific product status
     */
    protected function getStatusStatisticsQuery(bool $isActive, array $filters = []): array
    {
        $query = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->select(
                DB::raw('COUNT(DISTINCT products.id) as product_count'),
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_revenue'),
                DB::raw('AVG(order_items.total_price / order_items.quantity) as avg_price')
            )
            ->where('products.is_active', $isActive)
            ->where('orders.status', '!=', 'cancelled');

        $this->applyDateFilters($query, $filters);
        $this->applyCustomerFilters($query, $filters);

        $result = $query->first();

        // Handle case where no orders match the criteria
        if (! $result) {
            return [
                'product_count' => 0,
                'total_quantity' => 0,
                'total_revenue' => 0.0,
                'avg_price' => 0.0,
                'unit' => 'amount',
            ];
        }

        return [
            'product_count' => (int) $result->product_count,
            'total_quantity' => (int) $result->total_quantity,
            'total_revenue' => (float) $result->total_revenue,
            'avg_price' => (float) ($result->avg_price ?? 0.0),
            'unit' => 'amount',
        ];
    }

    /**
     * Apply date range filters to query
     *
     * @param  Builder  $query
     */
    protected function applyDateFilters($query, array $filters = []): void
    {
        $startDate = Arr::get($filters, 'start_date');
        $endDate = Arr::get($filters, 'end_date');

        if ($startDate) {
            $query->whereDate('orders.placed_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('orders.placed_at', '<=', $endDate);
        }
    }

    /**
     * Apply customer filters to query
     *
     * @param  Builder  $query
     */
    protected function applyCustomerFilters($query, array $filters = []): void
    {
        $customerIds = Arr::get($filters, 'customer_ids');

        // Skip filtering if customer_ids is 'all' or empty
        if ($customerIds === 'all' || empty($customerIds)) {
            return;
        }

        if (is_array($customerIds) && count($customerIds) > 0) {
            // Check if the query already includes customer_promotional_products table
            $sql = $query->toSql();
            $hasCustomerPromotionalProducts = strpos($sql, 'customer_promotional_products') !== false;

            if ($hasCustomerPromotionalProducts) {
                // For customer filtering directly on promotional products
                $query->whereIn('customer_promotional_products.customer_id', $customerIds);
            } else {
                // For customer filtering on orders (join through users and customers)
                $hasUsers = strpos($sql, 'users') !== false;
                $hasCustomers = strpos($sql, 'customers') !== false;

                if (! $hasUsers) {
                    $query->join('users', 'orders.user_id', '=', 'users.id');
                }
                if (! $hasCustomers) {
                    $query->join('customers', 'users.customer_id', '=', 'customers.id');
                }

                $query->whereIn('customers.id', $customerIds);
            }
        }
    }

    /**
     * Get comprehensive product statistics for API response
     */
    public function getComprehensiveStatistics(array $filters = []): array
    {
        $salesData = $this->getSalesVolumeByProduct($filters);
        $topProducts = $this->getTopNSalesProducts(10, $filters);
        $ctrData = $this->getPromotedProductsCTR($filters);
        $statusData = $this->getStatisticsByStatus($filters);

        return [
            'sales_by_product' => $salesData,
            'top_products' => $topProducts,
            'click_through_rate' => $ctrData,
            'statistics_by_status' => $statusData,
        ];
    }
}
