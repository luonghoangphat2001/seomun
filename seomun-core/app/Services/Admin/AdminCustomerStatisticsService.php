<?php

namespace App\Services\Admin;

use App\Models\Customer;
use App\Models\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminCustomerStatisticsService
{
    public function __construct(protected OrderRepositoryInterface $orderRepo) {}

    /**
     * Get customer statistics
     */
    public function getCustomerStatistics(array $customerIds = [], ?string $salesRep = null): array
    {
        $summary = $this->getSummaryStatistics($customerIds, $salesRep);
        $salesByRep = $this->getSalesByRepresentative($customerIds);
        $customerActivity = $this->getCustomerActivityStatus($customerIds, $salesRep);
        $customerDetails = $this->getCustomerDetails($customerIds, $salesRep);

        return [
            'summary' => $summary,
            'sales_by_representative' => $salesByRep,
            'customer_activity_status' => $customerActivity,
            'customer_details' => $customerDetails,
        ];
    }

    /**
     * Get summary statistics
     */
    private function getSummaryStatistics(array $customerIds = [], ?string $salesRep = null): array
    {
        $query = Customer::query();

        if (! empty($customerIds)) {
            $query->whereIn('id', $customerIds);
        }

        if ($salesRep) {
            $query->where('sales_representative_name', 'like', "%{$salesRep}%");
        }

        $totalCustomers = $query->count();

        $newCustomers = $query->where('created_at', '>=', now()->startOfMonth())->count();

        $activeCustomers = $this->getActiveCustomersCount($customerIds, $salesRep);

        $activeRate = $totalCustomers > 0 ? round(($activeCustomers / $totalCustomers) * 100, 2) : 0;

        $avgLTV = $this->getAverageLTV($customerIds, $salesRep);

        return [
            'total_customers' => [
                'value' => $totalCustomers,
                'label' => 'Total Customers',
                'unit' => 'count',
                'description' => 'Managed accounts',
            ],
            'new_customers' => [
                'value' => $newCustomers,
                'label' => 'New Customers',
                'unit' => 'count',
                'description' => 'Joined this month',
                'change' => $this->calculateMonthOverMonthChange('new_customers', $customerIds, $salesRep),
            ],
            'active_rate' => [
                'value' => $activeRate,
                'label' => 'Active Rate',
                'unit' => 'percent',
                'description' => 'Purchased in 30 days',
                'change' => $this->calculateMonthOverMonthChange('active_rate', $customerIds, $salesRep),
            ],
            'avg_ltv' => [
                'value' => $avgLTV,
                'label' => 'Avg. LTV',
                'unit' => 'amount',
                'description' => 'Lifetime value',
            ],
        ];
    }

    /**
     * Get active customers count (purchased in last 30 days)
     */
    private function getActiveCustomersCount(array $customerIds = [], ?string $salesRep = null): int
    {
        $query = Customer::query()
            ->whereHas('users.orders', function ($q) {
                $q->where('placed_at', '>=', now()->subDays(30))
                    ->where('status', 'completed');
            });

        if (! empty($customerIds)) {
            $query->whereIn('id', $customerIds);
        }

        if ($salesRep) {
            $query->where('sales_representative_name', 'like', "%{$salesRep}%");
        }

        return $query->count();
    }

    /**
     * Get average lifetime value per customer
     */
    private function getAverageLTV(array $customerIds = [], ?string $salesRep = null): float
    {
        $query = DB::table('orders')
            ->select(DB::raw('SUM(orders.total_amount) as total_revenue'))
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->join('customers', 'users.customer_id', '=', 'customers.id')
            ->where('orders.status', 'completed');

        if (! empty($customerIds)) {
            $query->whereIn('customers.id', $customerIds);
        }

        if ($salesRep) {
            $query->where('customers.sales_representative_name', 'like', "%{$salesRep}%");
        }

        $totalRevenue = $query->first()->total_revenue ?? 0;
        $customerCount = $this->getTotalCustomersWithOrders($customerIds, $salesRep);

        return $customerCount > 0 ? round($totalRevenue / $customerCount, 2) : 0;
    }

    /**
     * Get total customers with at least one order
     */
    private function getTotalCustomersWithOrders(array $customerIds = [], ?string $salesRep = null): int
    {
        $query = Customer::query()
            ->whereHas('users.orders', function ($q) {
                $q->where('status', 'completed');
            });

        if (! empty($customerIds)) {
            $query->whereIn('id', $customerIds);
        }

        if ($salesRep) {
            $query->where('sales_representative_name', 'like', "%{$salesRep}%");
        }

        return $query->count();
    }

    /**
     * Calculate month over month change
     */
    private function calculateMonthOverMonthChange(string $metric, array $customerIds = [], ?string $salesRep = null): float
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;
        $previousMonth = $currentMonth - 1;
        $previousYear = $currentYear;

        if ($previousMonth === 0) {
            $previousMonth = 12;
            $previousYear--;
        }

        $currentValue = $this->getMetricValueForMonth($metric, $currentYear, $currentMonth, $customerIds, $salesRep);
        $previousValue = $this->getMetricValueForMonth($metric, $previousYear, $previousMonth, $customerIds, $salesRep);

        if ($previousValue <= 0) {
            return 0;
        }

        return round((($currentValue - $previousValue) / $previousValue) * 100, 2);
    }

    /**
     * Get metric value for specific month
     */
    private function getMetricValueForMonth(string $metric, int $year, int $month, array $customerIds = [], ?string $salesRep = null): float
    {
        $startDate = now()->year($year)->month($month)->startOfMonth();
        $endDate = now()->year($year)->month($month)->endOfMonth();

        switch ($metric) {
            case 'new_customers':
                $query = Customer::query()
                    ->whereBetween('created_at', [$startDate, $endDate]);

                if (! empty($customerIds)) {
                    $query->whereIn('id', $customerIds);
                }

                if ($salesRep) {
                    $query->where('sales_representative_name', 'like', "%{$salesRep}%");
                }

                return $query->count();

            case 'active_rate':
                $activeCount = Customer::query()
                    ->whereHas('users.orders', function ($q) use ($startDate, $endDate) {
                        $q->whereBetween('placed_at', [$startDate, $endDate])
                            ->where('status', 'completed');
                    })
                    ->when(! empty($customerIds), function ($q) use ($customerIds) {
                        $q->whereIn('id', $customerIds);
                    })
                    ->when($salesRep, function ($q) use ($salesRep) {
                        $q->where('sales_representative_name', 'like', "%{$salesRep}%");
                    })
                    ->count();

                $totalCount = Customer::query()
                    ->when(! empty($customerIds), function ($q) use ($customerIds) {
                        $q->whereIn('id', $customerIds);
                    })
                    ->when($salesRep, function ($q) use ($salesRep) {
                        $q->where('sales_representative_name', 'like', "%{$salesRep}%");
                    })
                    ->count();

                return $totalCount > 0 ? ($activeCount / $totalCount) * 100 : 0;

            default:
                return 0;
        }
    }

    /**
     * Get sales by representative
     */
    private function getSalesByRepresentative(array $customerIds = []): array
    {
        $query = DB::table('orders')
            ->select(
                'customers.sales_representative_name as representative',
                DB::raw('SUM(orders.total_amount) as total_sales'),
                DB::raw('COUNT(DISTINCT orders.id) as total_orders')
            )
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->join('customers', 'users.customer_id', '=', 'customers.id')
            ->where('orders.status', 'completed')
            ->groupBy('customers.sales_representative_name');

        if (! empty($customerIds)) {
            $query->whereIn('customers.id', $customerIds);
        }

        $data = $query->get();

        return $data->map(function ($item) {
            return [
                'representative' => $item->representative,
                'total_sales' => (float) $item->total_sales,
                'total_orders' => (int) $item->total_orders,
                'unit' => 'count',
            ];
        })->toArray();
    }

    /**
     * Get customer activity status distribution
     */
    private function getCustomerActivityStatus(array $customerIds = [], ?string $salesRep = null): array
    {
        $query = Customer::query();

        if (! empty($customerIds)) {
            $query->whereIn('id', $customerIds);
        }

        if ($salesRep) {
            $query->where('sales_representative_name', 'like', "%{$salesRep}%");
        }

        $totalCustomers = $query->count();

        $activeCount = $this->getActiveCustomersCount($customerIds, $salesRep);
        $newCount = $query->where('created_at', '>=', now()->startOfMonth())->count();
        $inactiveCount = $totalCustomers - $activeCount - $newCount;

        return [
            'active' => [
                'value' => $activeCount,
                'percentage' => $totalCustomers > 0 ? round(($activeCount / $totalCustomers) * 100, 2) : 0,
                'label' => 'Active',
                'unit' => 'count',
            ],
            'new' => [
                'value' => $newCount,
                'percentage' => $totalCustomers > 0 ? round(($newCount / $totalCustomers) * 100, 2) : 0,
                'label' => 'New',
                'unit' => 'count',
            ],
            'inactive' => [
                'value' => $inactiveCount,
                'percentage' => $totalCustomers > 0 ? round(($inactiveCount / $totalCustomers) * 100, 2) : 0,
                'label' => 'Inactive',
                'unit' => 'count',
            ],
        ];
    }

    /**
     * Get customer details with statistics
     */
    private function getCustomerDetails(array $customerIds = [], ?string $salesRep = null): array
    {
        $query = Customer::query()
            ->select([
                'customers.id',
                'customers.company_name as customer_name',
                'customers.sales_representative_name as sales_rep',
                DB::raw('COUNT(DISTINCT orders.id) as total_orders'),
                DB::raw('SUM(orders.total_amount) as cumulative_sales'),
                DB::raw('AVG(orders.total_amount) as average_order_value'),
                DB::raw('MAX(orders.placed_at) as last_order_date'),
            ])
            ->leftJoin('users', 'customers.id', '=', 'users.customer_id')
            ->leftJoin('orders', 'users.id', '=', 'orders.user_id')
            ->where('orders.status', 'completed')
            ->groupBy('customers.id', 'customers.company_name', 'customers.sales_representative_name');

        if (! empty($customerIds)) {
            $query->whereIn('customers.id', $customerIds);
        }

        if ($salesRep) {
            $query->where('customers.sales_representative_name', 'like', "%{$salesRep}%");
        }

        $data = $query->get();

        return $data->map(function ($item) {
            return [
                'customer_id' => $item->id,
                'customer_name' => $item->customer_name,
                'status' => $this->determineCustomerStatus($item->last_order_date),
                'orders' => (int) $item->total_orders,
                'cumulative_sales' => (float) $item->cumulative_sales,
                'aov' => (float) $item->average_order_value,
                'sales_rep' => $item->sales_rep,
                'last_order' => $item->last_order_date ? Carbon::parse($item->last_order_date)->format('Y-m-d H:i:s') : null,
            ];
        })->toArray();
    }

    /**
     * Determine customer status based on last order date
     */
    private function determineCustomerStatus($lastOrderDate): string
    {
        if (! $lastOrderDate) {
            return 'inactive';
        }

        $lastOrder = new \DateTime($lastOrderDate);
        $now = new \DateTime;
        $diff = $now->diff($lastOrder);

        if ($diff->days <= 30) {
            return 'active';
        } elseif ($diff->days <= 90) {
            return 'inactive';
        } else {
            return 'dormant';
        }
    }
}
