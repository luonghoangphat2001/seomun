<?php

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PaymentRepositoryInterface
{
    /**
     * get Paginate of payments transaction
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get payment analytics for dashboard
     */
    public function getAnalytics(array $filters = []): array;

    /**
     * Get weekly payment data for dashboard
     */
    public function getDataWeekly(array $filters = []): array;

    /**
     * Get daily payment data for dashboard
     */
    public function getDataDaily(array $filters = []): array;

    /**
     * Get payment statistics
     */
    public function getPaymentStatistics(array $customerIds = [], array $configPeriod = []): array;

    /**
     * Find a payment transaction by ID
     */
    public function findById(int $id): ?\App\Models\PaymentTransaction;
}
