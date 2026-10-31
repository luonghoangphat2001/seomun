<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function __construct(protected User $user) {}

    /**
     * Get daily members for dashboard
     */
    public function getDailyMembers(array $filters = []): array
    {
        return $this->user->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->filters($filters)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Get weekly members for dashboard
     */
    public function getWeeklyMembers(array $filters = []): array
    {
        return $this->user->selectRaw('YEARWEEK(created_at, 1) as week, MIN(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY)) as date, COUNT(*) as total')
            ->filters($filters)
            ->groupBy('week')
            ->orderBy('week')
            ->get()
            ->toArray();
    }

    /**
     * Get members analytics for dashboard
     */
    public function getMembersAnalytics(array $filters = []): array
    {
        $currentFilters = [
            'start_date' => $filters['start_date'],
            'end_date' => $filters['end_date'],
            'customer_ids' => $filters['customer_ids'] ?? [],
        ];

        $queryCurrent = $this->user->selectRaw("COUNT(*) as total, 'curr' as period")
            ->filters($currentFilters);

        $previousFilters = [
            'start_date' => $filters['previous_start_date'],
            'end_date' => $filters['previous_end_date'],
            'customer_ids' => $filters['customer_ids'] ?? [],
        ];

        $queryPrevious = $this->user->selectRaw("COUNT(*) as total, 'prev' as period")
            ->filters($previousFilters);

        $result = $queryCurrent->union($queryPrevious)->get();

        return $result->keyBy('period')->toArray();
    }
}
