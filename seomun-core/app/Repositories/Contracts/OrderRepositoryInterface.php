<?php

namespace App\Repositories\Contracts;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function create(array $orderData, array $itemsData): Order;

    public function paginateForUser(int $userId, int $perPage = 15): LengthAwarePaginator;

    public function findForUser(string $orderNumber, int $userId): ?Order;

    public function getDashboardAnalytics(array $filters = []): array;

    public function getWeeklyOrders(array $filters = []): array;

    public function getWeeklyOrderSales(array $filters = []): array;

    public function getDailyOrders(array $filters = []): array;

    public function getDailyOrderSales(array $filters = []): array;

    public function getSalesAnalytics(array $filters = []): array;

    public function getSummaryOrders(array $filters = []): array;

    public function getSaleStatics(array $filters = []): array;

    public function getSaleOrderProductStatics(array $filters = []): array;

    public function getSaleCategoryStatic(array $filters = []): array;

    public function getSaleCustomerStatics(array $filters = []): array;

    public function getOrderStatusCounts(array $filters = []): array;

    public function getDailyOrderCounts(array $filters = []): array;

    public function getWeeklyOrderCounts(array $filters = []): array;
}
