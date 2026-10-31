<?php

namespace App\Repositories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class OrderRepository implements OrderRepositoryInterface
{
    public function create(array $orderData, array $itemsData): Order
    {
        return DB::transaction(function () use ($orderData, $itemsData) {
            /** @var Order $order */
            $order = Order::create($orderData);

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);
            }

            return $order->fresh(['items']);
        });
    }

    public function paginateForUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::with([
            'items.designWorkflow',
            'items.designGroup.uploadArtworks',
            'items.designGroup.orderArtworks',
        ])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findForUser(string $orderNumber, int $userId): ?Order
    {
        return Order::with([
            'items.designWorkflow',
            'items.designGroup.uploadArtworks',
            'items.designGroup.orderArtworks',
        ])
            ->where('order_number', $orderNumber)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Get dashboard analytics for orders
     */
    public function getDashboardAnalytics(array $filters = []): array
    {
        return $this->getAnalyticForDashboard($filters)->first()->toArray();
    }

    private function getAnalyticForDashboard(array $filters = []): Builder
    {
        return Order::selectRaw('DATE(created_at) as date, COUNT(*) as total, SUM(total_amount) as sales')->filters($filters)->groupBy('date')->orderBy('date');
    }

    /**
     * Get weekly orders for dashboard
     */
    public function getWeeklyOrders(array $filters = []): array
    {
        $selectRaw = 'YEARWEEK(created_at, 1) as week, MIN(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY)) as date, COUNT(*) as total, SUM(total_amount) as total_amount';

        $query = Order::selectRaw($selectRaw)->filters($filters)->groupBy('week')->orderBy('week');

        return $query->get()->toArray();
    }

    /**
     * Get weekly order sales for dashboard
     */
    public function getWeeklyOrderSales(array $filters = []): array
    {
        $selectRaw = 'YEARWEEK(created_at, 1) as week, MIN(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY)) as date, COUNT(*) as total, SUM(total_amount) as total_amount';

        $query = Order::selectRaw($selectRaw)->isCompleted()->filters($filters)->groupBy('week')->orderBy('week');

        return $query->get()->toArray();
    }

    /**
     * Get daily orders for dashboard
     */
    public function getDailyOrders(array $filters = []): array
    {
        return $this->queryDailyOrders($filters)->get()->keyBy('date')->toArray();
    }

    /**
     * Get daily order sales for dashboard
     */
    public function getDailyOrderSales(array $filters = []): array
    {
        return $this->queryDailyOrders($filters)->isCompleted()->get()->keyBy('date')->toArray();
    }

    private function queryDailyOrders(array $filters = []): Builder
    {
        $selectRaw = 'DATE(created_at) as date, COUNT(*) as total, SUM(total_amount) as total_amount';

        $query = Order::selectRaw($selectRaw)->filters($filters)->groupBy('date')->orderBy('date');

        return $query;
    }

    /**
     * Get sales analytics for dashboard
     */
    public function getSalesAnalytics(array $filters = []): array
    {
        $currentFilters = [
            'start_date' => $filters['start_date'],
            'end_date' => $filters['end_date'],
            'customer_ids' => $filters['customer_ids'] ?? [],
        ];

        $queryCurrent = Order::selectRaw("COUNT(*) as total, SUM(total_amount) as total_amount, 'curr' as period")
            ->filters($currentFilters)
            ->isCompleted();

        $previousFilters = [
            'start_date' => $filters['previous_start_date'],
            'end_date' => $filters['previous_end_date'],
            'customer_ids' => $filters['customer_ids'] ?? [],
        ];

        $queryPrevious = Order::selectRaw("COUNT(*) as total, SUM(total_amount) as total_amount, 'prev' as period")
            ->filters($previousFilters)
            ->isCompleted();

        $combined = $queryCurrent->union($queryPrevious)->get();

        return $combined->keyBy('period')->toArray();
    }

    /**
     * Sumamry orders
     */
    public function getSummaryOrders(array $filters = []): array
    {
        $filterPeriod = [
            'start_date' => $filters['start_date'] ?? now()->subMonth()->toDateString(),
            'end_date' => $filters['end_date'] ?? now()->toDateString(),
            'previous_start_date' => $filters['previous_start_date'] ?? now()->subMonth()->subMonth()->toDateString(),
            'previous_end_date' => $filters['previous_end_date'] ?? now()->subMonth()->toDateString(),
        ];

        if (! empty($filters)) {
            $filters = array_diff_key($filters, $filterPeriod);
        }

        $refundOrCancelStatuses = OrderStatus::getRefundOrCancellationProcess();
        $statusList = "'".implode("','", $refundOrCancelStatuses)."'";

        $selectRaw = '
            SUM(CASE WHEN created_at >= ? AND created_at <= ? THEN total_amount ELSE 0 END) as orders_current_amount,
            COUNT(CASE WHEN created_at >= ? AND created_at <= ? THEN 1 END) as orders_current_total,
            COUNT(CASE WHEN created_at >= ? AND created_at <= ? THEN 1 END) as orders_previous_total,

            COUNT(CASE WHEN created_at >= ? AND created_at <= ? AND status = ? THEN total_amount ELSE 0 END) as sales_current_total,
            SUM(CASE WHEN created_at >= ? AND created_at <= ? AND status = ? THEN total_amount ELSE 0 END) as sales_current_amount,
            COUNT(CASE WHEN created_at >= ? AND created_at <= ? AND status = ? THEN total_amount ELSE 0 END) as sales_previous_total,
            
            COUNT(CASE WHEN status IN ('.implode(',', array_fill(0, count(explode(',', $statusList)), '?')).') AND created_at >= ? AND created_at <= ? THEN 1 END) as cancellations_current_total,
            SUM(CASE WHEN status IN ('.implode(',', array_fill(0, count(explode(',', $statusList)), '?')).') AND created_at >= ? AND created_at <= ? THEN 1 END) as cancellations_current_total_amount,
            COUNT(CASE WHEN status IN ('.implode(',', array_fill(0, count(explode(',', $statusList)), '?')).') AND created_at >= ? AND created_at <= ? THEN 1 END) as cancellations_previous_total
        ';

        $bindings = [
            // Orders
            $filterPeriod['start_date'], $filterPeriod['end_date'], // currents
            $filterPeriod['start_date'], $filterPeriod['end_date'], // currents
            $filterPeriod['previous_start_date'], $filterPeriod['previous_end_date'], // previous,

            // Sales
            $filterPeriod['start_date'], $filterPeriod['end_date'], OrderStatus::Completed->value,
            $filterPeriod['start_date'], $filterPeriod['end_date'], OrderStatus::Completed->value,
            $filterPeriod['previous_start_date'], $filterPeriod['previous_end_date'], OrderStatus::Completed->value,

            // Cancellations
            ...$refundOrCancelStatuses, $filterPeriod['start_date'], $filterPeriod['end_date'],
            ...$refundOrCancelStatuses, $filterPeriod['start_date'], $filterPeriod['end_date'],
            ...$refundOrCancelStatuses, $filterPeriod['previous_start_date'], $filterPeriod['previous_end_date'],
        ];

        $result = Order::selectRaw($selectRaw, $bindings)->filters($filters)->first();

        return $result?->toArray() ?? [];
    }

    /**
     * Sale static (product, category, user)
     */
    public function getSaleStatics(array $filters = []): array
    {

        $result = Order::with(['user', 'product', 'product.category'])->filters($filters)->get();

        return $result->toArray();
    }

    /**
     * Summary of get sale products statics
     */
    public function getSaleOrderProductStatics(array $filters = []): array
    {
        $result = Order::selectRaw('products.id, products.name, SUM(order_items.quantity) as total_quantity, SUM(orders.total_amount) as total_amount')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'orders.product_id', '=', 'products.id')
            ->filters($filters)
            ->groupBy('orders.product_id')
            ->get();

        return $result->toArray();
    }

    /**
     * Summary of sale category statics
     */
    public function getSaleCategoryStatic(array $filters = []): array
    {
        $result = Order::selectRaw('categories.id, categories.name, SUM(order_items.quantity) as total_quantity, SUM(orders.total_amount) as total_amount')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'orders.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->filters($filters)
            ->groupBy('categories.id')
            ->get();

        return $result->toArray();
    }

    /**
     * Summary of sale customer statics
     */
    public function getSaleCustomerStatics(array $filters = []): array
    {
        $result = Order::selectRaw('users.id, users.name, SUM(order_items.quantity) as total_quantity, SUM(orders.total_amount) as total_amount')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->filters($filters)
            ->groupBy('orders.user_id')
            ->get();

        return $result->toArray();
    }

    /**
     * Summary of order status counts
     */
    public function getOrderStatusCounts(array $filters = []): array
    {
        $filterPeriod = [
            'start_date' => $filters['start_date'] ?? now()->subMonth()->toDateString(),
            'end_date' => $filters['end_date'] ?? now()->toDateString(),
            'previous_start_date' => $filters['previous_start_date'] ?? now()->subMonth()->subMonth()->toDateString(),
            'previous_end_date' => $filters['previous_end_date'] ?? now()->subMonth()->toDateString(),
        ];

        if (! empty($filters)) {
            $filters = array_diff_key($filters, $filterPeriod);
        }

        $orderStatuses = array_map(fn ($case) => $case->value, OrderStatus::cases());

        // Count with status
        $selectParts = [];
        foreach ($orderStatuses as $status) {
            $selectParts[] = "COUNT(CASE WHEN status = ? AND created_at >= ? AND created_at <= ? THEN 1 END) as {$status}";
        }

        $selectRaw = implode(',', $selectParts);

        // Bind parameters
        $bindings = [];
        foreach ($orderStatuses as $status) {
            $bindings[] = $status;
            $bindings[] = $filterPeriod['start_date'];
            $bindings[] = $filterPeriod['end_date'];
        }

        $result = Order::selectRaw($selectRaw, $bindings)
            ->filters($filters)
            ->first();

        return $result->toArray();
    }

    /**
     * Get daily order status counts for chart
     */
    public function getDailyOrderCounts(array $filters = []): array
    {
        $selectParts = ['DATE(created_at) as date'];
        $selectParts[] = 'COUNT(*) as total';
        $selectParts[] = 'SUM(total_amount) as total_amount';

        $selectRaw = implode(',', $selectParts);

        $result = Order::selectRaw($selectRaw)
            ->filters($filters)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $result->toArray();
    }

    /**
     * Get weekly order counts for chart
     */
    public function getWeeklyOrderCounts(array $filters = []): array
    {
        $selectParts = [
            'YEARWEEK(created_at, 1) as week',
            'MIN(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY)) as date',
        ];
        $selectParts[] = 'COUNT(*) as total';
        $selectParts[] = 'SUM(total_amount) as total_amount';

        $selectRaw = implode(',', $selectParts);

        $result = Order::selectRaw($selectRaw)
            ->filters($filters)
            ->groupBy('week')
            ->orderBy('week')
            ->get();

        return $result->toArray();
    }
}
