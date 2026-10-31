<?php

namespace App\Services\Admin;

use App\Enums\InquiryStatus;
use App\Enums\PaymentStatus;
use App\Events\DashboardNotificationHightlightUpdated;
use App\Events\DashboardOperationalMetricUpdated;
use App\Models\Customer;
use App\Models\Inquiry;
use App\Models\PaymentTransaction;
use App\Models\Product;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Repositories\Contracts\ReviewRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;

class AdminDashboardService
{
    public function __construct(
        protected OrderRepositoryInterface $orderRepo,
        protected PaymentRepositoryInterface $paymentRepo,
        protected ReviewRepositoryInterface $reviewRepo,
        protected UserRepositoryInterface $userRepo,
    ) {}

    /**
     * Get graphic data
     */
    public function getGraphData(array $customerIds = [], array $config = []): array
    {
        return [
            'daily' => $this->getDailyData($config, $customerIds),
            'weekly' => $this->getWeeklyData($config, $customerIds),
        ];
    }

    public function periodConfig(string $period): array
    {
        return match ($period) {
            '7d' => [
                'current_start' => now()->subDays(7),
                'current_end' => now(),
                'previous_start' => now()->subDays(14),
                'previous_end' => now()->subDays(7),
            ],
            default => [
                'current_start' => now()->subDays(30),
                'current_end' => now(),
                'previous_start' => now()->subDays(60),
                'previous_end' => now()->subDays(30),
            ],
        };
    }

    /**
     * get notification highlight
     */
    public function notificationHighlight(): array
    {
        return [
            'customer_unapproved' => $this->getCustomersPending(),
            'inquiries_in_progress' => $this->getInquiriesInProgress(),
            'product_out_stock_total' => $this->getProductOutStockTotal(),
        ];
    }

    /**
     * Get summary key indicator
     */
    public function metric(array $customerIds = [], array $config = []): array
    {

        try {
            return [
                'sales' => $this->getAnalyticForSales($customerIds, $config),
                'members' => $this->getMembers($customerIds, $config),
                'orders' => $this->getOrders($customerIds, $config),
                'payments' => $this->getPayments($customerIds, $config),
                'reviews' => $this->getReviews($customerIds, $config),
            ];
        } catch (\Throwable $th) {
            \Log::error('Dashboard metrics error: ' . $th->getMessage());

            return [
                'sales' => ['label' => 'Sales', 'current' => 0, 'previous' => 0, 'change' => 0, 'unit' => 'amount'],
                'members' => ['label' => 'Members', 'current' => 0, 'previous' => 0, 'change' => 0, 'unit' => 'count'],
                'orders' => ['label' => 'Orders', 'current' => 0, 'previous' => 0, 'change' => 0, 'unit' => 'count'],
                'reviews' => ['label' => 'Reviews', 'current' => 0, 'previous' => 0, 'change' => 0, 'unit' => 'count'],
                'payments' => [
                    'success' => ['label' => 'Successful payments', 'current' => 0, 'previous' => 0, 'change' => 0, 'unit' => 'count'],
                    'outstanding' => ['label' => 'Outstanding payments', 'current' => 0, 'unit' => 'count'],
                    'rate' => ['label' => 'Payment success rate', 'current' => 0, 'unit' => 'percent'],
                ],
            ];
        }
    }

    public function getAnalyticForSales(array $customerIds = [], array $config = []): array
    {
        $filters = [
            'start_date' => $config['current_start'],
            'end_date' => $config['current_end'],
            'previous_start_date' => $config['previous_start'],
            'previous_end_date' => $config['previous_end'],
            'customer_ids' => $customerIds,
        ];

        $getSalesAnalytics = $this->orderRepo->getSalesAnalytics($filters);
        $currentTotal = (float) $getSalesAnalytics['curr']['total_amount'];
        $previousTotal = (float) $getSalesAnalytics['prev']['total_amount'];

        $change = $this->calculateChange($currentTotal, $previousTotal);

        return [
            'label' => 'Sales',
            'current' => $currentTotal,
            'previous' => $previousTotal,
            'change' => $change,
            'unit' => 'amount',
        ];
    }

    /**
     * Get members
     */
    public function getMembers(array $customerIds = [], array $config = []): array
    {
        $membersAnalytic = $this->getMembersAnalyticsData($config['current_start'], $config['current_end'], $config['previous_start'], $config['previous_end'], $customerIds);

        $memberCurrentTotal = $membersAnalytic['curr']['total'];
        $memberPreviousTotal = $membersAnalytic['prev']['total'];
        $change = $this->calculateChange($memberCurrentTotal, $memberPreviousTotal);

        return [
            'label' => 'Members',
            'current' => $memberCurrentTotal,
            'previous' => $memberPreviousTotal,
            'change' => $change,
            'unit' => 'count',
        ];
    }

    /**
     * Get orders
     */
    public function getOrders(array $customerIds = [], array $config = []): array
    {
        $orders = $this->getOrdersAnalytics([
            'start_date' => $config['current_start'],
            'end_date' => $config['current_end'],
            'previous_start_date' => $config['previous_start'],
            'previous_end_date' => $config['previous_end'],
            'customer_ids' => $customerIds,
        ]);

        $currentTotal = $orders['curr']['total'];
        $previousTotal = $orders['prev']['total'];
        $change = $this->calculateChange($currentTotal, $previousTotal);

        return [
            'label' => 'Orders',
            'current' => $currentTotal,
            'previous' => $previousTotal,
            'change' => $change,
            'unit' => 'count',
        ];
    }

    /**
     * Get orders analytics
     */
    public function getOrdersAnalytics(array $filters = []): array
    {
        $filters = [
            'start_date' => $filters['start_date'] ?? null,
            'end_date' => $filters['end_date'] ?? null,
            'previous_start_date' => $filters['previous_start_date'] ?? null,
            'previous_end_date' => $filters['previous_end_date'] ?? null,
            'customer_ids' => $filters['customer_ids'] ?? [],
        ];

        return $this->orderRepo->getSalesAnalytics($filters);
    }

    /**
     * Get payment transaction
     */
    public function getPayments(array $customerIds = [], array $config = []): array
    {
        $formatFilters = [
            'start_date' => $config['current_start'],
            'end_date' => $config['current_end'],
            'previous_start_date' => $config['previous_start'],
            'previous_end_date' => $config['previous_end'],
            'customer_ids' => $customerIds,
        ];

        $paymentsSuccess = $this->getPaymentsData([...$formatFilters, 'statuses' => [PaymentStatus::PAID]]);
        $paymentOutstanding = $this->getPaymentsData([...$formatFilters, 'statuses' => [PaymentStatus::PENDING, PaymentStatus::PROCESSING]]);
        $totalPayments = $paymentsSuccess + $paymentOutstanding;
        $paymentSuccessRate = $totalPayments > 0 ? ($paymentsSuccess / $totalPayments) * 100 : 0;

        $previousFilters = [...$formatFilters, 'statuses' => [PaymentStatus::PAID], 'start_date' => $config['previous_start'], 'end_date' => $config['previous_end']];
        $paymentsSuccessPrevious = $this->getPaymentsData($previousFilters);
        $change = $this->calculateChange($paymentsSuccess, $paymentsSuccessPrevious);

        return [
            'success' => [
                'label' => 'Successful payments',
                'current' => $paymentsSuccess,
                'previous' => $paymentsSuccessPrevious,
                'change' => $change,
                'unit' => 'count',
            ],
            'outstanding' => [
                'label' => 'Outstanding payments',
                'current' => $paymentOutstanding,
                'unit' => 'count',
            ],
            'rate' => [
                'label' => 'Payment success rate',
                'current' => round($paymentSuccessRate, 2),
                'unit' => 'percent',
            ],
        ];
    }

    /**
     * Get reviews
     */
    public function getReviews(array $customerIds = [], array $config = []): array
    {
        $reviewsAnalytic = $this->getReviewsAnalyticsData(
            $config['current_start'],
            $config['current_end'],
            $config['previous_start'],
            $config['previous_end'],
            $customerIds
        );

        $currentTotal = $reviewsAnalytic['curr']['total'];
        $previousTotal = $reviewsAnalytic['prev']['total'];
        $change = $this->calculateChange($currentTotal, $previousTotal);

        return [
            'label' => 'Reviews',
            'current' => $currentTotal,
            'previous' => $previousTotal,
            'change' => $change,
            'unit' => 'count',
        ];
    }

    private function getReviewsAnalyticsData(string $startDate, string $endDate, string $previousStartDate, string $previousEndDate, array $customerIds = []): array
    {
        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'previous_start_date' => $previousStartDate,
            'previous_end_date' => $previousEndDate,
            'customer_ids' => $customerIds,
        ];

        return $this->reviewRepo->getReviewsAnalytics($filters);
    }

    /**
     * Get customers has status pending
     */
    private function getCustomersPending(): int
    {
        return Customer::isPending()->count();
    }

    /**
     * Broadcast operational metrics
     */
    public function broadcastOperationalMetrics(): void
    {
        \Log::info('Broadcasting metrics has change');
        event(new DashboardOperationalMetricUpdated);
    }

    /**
     * Broadcast notification highlight
     */
    public function broadcastNotificationHighlight(): void
    {
        \Log::info('Broadcasting notifications has change');
        event(new DashboardNotificationHightlightUpdated);
    }

    private function getMembersAnalyticsData(string $startDate, string $endDate, string $previousStartDate, string $previousEndDate, array $customerIds = []): array
    {
        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'previous_start_date' => $previousStartDate,
            'previous_end_date' => $previousEndDate,
            'customer_ids' => $customerIds,
        ];

        $data = $this->userRepo->getMembersAnalytics($filters);

        return $data;
    }

    /**
     * Calculate increase/decrease
     */
    private function calculateChange(float $current, float $previous): float
    {
        if ($current <= 0 && $previous <= 0) {
            return 0;
        }

        if ($previous == 0) {
            return 0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }

    /**
     * Get payments data
     */
    private function getPaymentsData(array $filters = []): int
    {
        return PaymentTransaction::filters($filters)->count();
    }

    /**
     * Get daily data for dashboard
     */
    private function getDailyData(array $config, array $customerIds): array
    {
        $sales = $this->getDailySales($config, $customerIds);
        $members = $this->getDailyMembersData($config, $customerIds);
        $orders = $this->getDailyOrders($config, $customerIds);
        $payments = $this->getDailyPayments($config, $customerIds);
        $reviews = $this->getDailyReviewsData($config, $customerIds);

        return [
            'sales' => $sales,
            'members' => $members,
            'orders' => $orders,
            'payments' => $payments,
            'reviews' => $reviews,
        ];
    }

    /**
     * Get daily payments data for dashboard
     */
    private function getDailyPayments(array $config, array $customerIds): array
    {
        $payments = $this->getDailyPaymentQuery($config, $customerIds);
        $total = array_sum(array_column($payments, 'total'));
        $totalAmount = array_sum(array_column($payments, 'total_amount'));

        return [
            'data' => $payments,
            'total' => $total,
            'total_amount' => $totalAmount,
        ];
    }

    private function getDailyPaymentQuery(array $config, array $customerIds): array
    {
        $formattedConfig = [
            'start_date' => $config['current_start'],
            'end_date' => $config['current_end'],
            'customer_ids' => $customerIds,
            'status' => PaymentStatus::PAID,
        ];

        return $this->paymentRepo->getDataDaily($formattedConfig);
    }

    /**
     * Get daily members data for dashboard
     */
    private function getDailyMembersData(array $config, array $customerIds): array
    {
        $members = $this->getDailyMembers($config, $customerIds);
        $membersTotal = array_sum(array_column($members, 'total'));

        return [
            'data' => $members,
            'total' => $membersTotal,
        ];
    }

    /**
     * Get daily members
     */
    private function getDailyMembers(array $config, array $customerIds): array
    {
        $filterFormat = [
            'start_date' => $config['current_start'],
            'end_date' => $config['current_end'],
            'customer_ids' => $customerIds,
        ];

        return $this->userRepo->getDailyMembers($filterFormat);
    }

    private function getDailyReviewsData(array $config, array $customerIds): array
    {
        $filterFormat = [
            'start_date' => $config['current_start'],
            'end_date' => $config['current_end'],
            'customer_ids' => $customerIds,
        ];

        $reviews = $this->reviewRepo->getDataDaily($filterFormat);
        $reviewsTotal = array_sum(array_column($reviews, 'total'));

        return [
            'data' => $reviews,
            'total' => $reviewsTotal,
        ];
    }

    /**
     * Get daily orders data for dashboard
     */
    private function getDailyOrders(array $config, array $customerIds): array
    {
        $formattedConfig = [
            'start_date' => $config['current_start'],
            'end_date' => $config['current_end'],
            'customer_ids' => $customerIds,
        ];
        $orders = $this->orderRepo->getDailyOrders($formattedConfig);
        $ordersTotal = array_sum(array_column($orders, 'total'));
        $totalAmount = array_sum(array_column($orders, 'total_amount'));

        return [
            'data' => $orders,
            'total' => $ordersTotal,
            'total_amount' => $totalAmount,
        ];
    }

    /**
     * Get daily sales data for dashboard
     */
    private function getDailySales(array $config, array $customerIds = []): array
    {
        $formattedConfig = [
            'start_date' => $config['current_start'],
            'end_date' => $config['current_end'],
            'customer_ids' => $customerIds,
        ];
        $orderSalesData = $this->orderRepo->getDailyOrderSales($formattedConfig);
        $ordersTotal = array_sum(array_column($orderSalesData, 'total'));
        $totalAmount = array_sum(array_column($orderSalesData, 'total_amount'));

        return [
            'data' => $orderSalesData,
            'total' => $ordersTotal,
            'total_amount' => $totalAmount,
        ];
    }

    /**
     * Get weekly data for dashboard
     */
    private function getWeeklyData(array $config, array $customerIds): array
    {
        $sales = $this->getWeeklyOrderSales($config['current_start'], $config['current_end'], $customerIds);
        $orders = $this->getWeeklyOrders($config['current_start'], $config['current_end'], $customerIds);
        $members = $this->getWeeklyMembers($config['current_start'], $config['current_end'], $customerIds);
        $payments = $this->getWeeklyPayments($config['current_start'], $config['current_end'], $customerIds);
        $reviews = $this->getWeeklyReviews($config['current_start'], $config['current_end'], $customerIds);

        return [
            'sales' => $sales,
            'orders' => $orders,
            'members' => $members,
            'payments' => $payments,
            'reviews' => $reviews,
        ];
    }

    /**
     * Get weekly order sales data for dashboard
     */
    private function getWeeklyOrderSales(string $startDate, string $endDate, array $customerIds): array
    {
        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'customer_ids' => $customerIds,
        ];

        $data = $this->orderRepo->getWeeklyOrderSales($filters);

        return [
            'data' => $data,
            'total' => array_sum(array_column($data, 'total')),
            'total_amount' => array_sum(array_column($data, 'total_amount')),
        ];
    }

    /**
     * Get weekly members data for dashboard
     */
    private function getWeeklyMembers(string $startDate, string $endDate, array $customerIds): array
    {
        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'customer_ids' => $customerIds,
        ];

        $data = $this->userRepo->getWeeklyMembers($filters);

        return [
            'data' => $data,
            'total' => array_sum(array_column($data, 'total')),
        ];
    }

    /**
     * Get weekly payments data for dashboard
     */
    private function getWeeklyPayments(string $startDate, string $endDate, array $customerIds): array
    {
        $formatFilters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => PaymentStatus::PAID,
            'customer_ids' => $customerIds,
        ];

        $data = $this->paymentRepo->getDataWeekly($formatFilters);

        return [
            'data' => $data,
            'total' => array_sum(array_column($data, 'total')),
            'total_amount' => array_sum(array_column($data, 'total_amount')),
        ];
    }

    /**
     * Get weekly orders data for dashboard
     */
    private function getWeeklyOrders(string $startDate, string $endDate, array $customerIds): array
    {
        $formatFilters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'customer_ids' => $customerIds,
        ];

        $data = $this->orderRepo->getWeeklyOrders($formatFilters);

        return [
            'data' => $data,
            'total' => array_sum(array_column($data, 'total')),
            'total_amount' => array_sum(array_column($data, 'total_amount')),
        ];
    }

    private function getWeeklyReviews(string $startDate, string $endDate, array $customerIds): array
    {
        $formatFilters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'customer_ids' => $customerIds,
        ];

        $data = $this->reviewRepo->getDataWeekly($formatFilters);

        return [
            'data' => $data,
            'total' => array_sum(array_column($data, 'total')),
        ];
    }

    /**
     * Get product out stock total
     */
    private function getProductOutStockTotal(): int
    {
        return Product::IsOutOfStock()->count();
    }

    /**
     * Get inquiries in progress
     */
    private function getInquiriesInProgress(): int
    {
        return Inquiry::ofStatus(InquiryStatus::PENDING->value)->count();
    }
}
