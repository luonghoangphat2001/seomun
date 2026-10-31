<?php

namespace App\Services\Admin;

use App\Enums\UserStatus;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Arr;

class AdminMemberStatisticsService
{
    /**
     * Get new members by period
     */
    public function getNewMembersByPeriod(array $filters = []): array
    {
        $query = User::with('customer')
            ->where('status', '!=', UserStatus::WITHDRAWN)
            ->selectRaw('customer_id, DATE(created_at) as date, COUNT(id) as count')
            ->groupBy('customer_id', 'date')
            ->orderBy('date');

        $this->applyDateFilters($query, $filters, 'created_at');
        $this->applyCustomerFilters($query, $filters);

        $results = $query->get();

        return $results->map(function ($item) {
            return [
                'customer_id' => $item->customer_id,
                'customer_name' => optional($item->customer)->company_name ?? '',
                'date' => $item->date,
                'count' => (int) $item->count,
                'unit' => 'count',
            ];
        })->toArray();
    }

    /**
     * Get withdrawn members by period
     */
    public function getWithdrawnMembersByPeriod(array $filters = []): array
    {
        $query = User::with('customer')
            ->where('status', '=', UserStatus::WITHDRAWN)
            ->selectRaw('customer_id, DATE(updated_at) as date, COUNT(id) as count')
            ->groupBy('customer_id', 'date')
            ->orderBy('date');

        $this->applyDateFilters($query, $filters, 'updated_at');
        $this->applyCustomerFilters($query, $filters);

        $results = $query->get();

        return $results->map(function ($item) {
            return [
                'customer_id' => $item->customer_id,
                'customer_name' => optional($item->customer)->company_name ?? '',
                'date' => $item->date,
                'count' => (int) $item->count,
                'unit' => 'count',
            ];
        })->toArray();
    }

    /**
     * Get active members by period
     */
    public function getActiveMembersByPeriod(array $filters = []): array
    {
        $query = User::with('customer')
            ->where('status', '=', UserStatus::ACTIVE)
            ->whereNotNull('last_login_at')
            ->selectRaw('customer_id, DATE(last_login_at) as date, COUNT(DISTINCT id) as count')
            ->groupBy('customer_id', 'date')
            ->orderBy('date');

        $this->applyDateFilters($query, $filters, 'last_login_at');
        $this->applyCustomerFilters($query, $filters);

        $results = $query->get();

        return $results->map(function ($item) {
            return [
                'customer_id' => $item->customer_id,
                'customer_name' => optional($item->customer)->company_name ?? '',
                'date' => $item->date,
                'count' => (int) $item->count,
                'unit' => 'count',
            ];
        })->toArray();
    }

    /**
     * Get members by membership level
     */
    public function getMembersByLevel(array $filters = []): array
    {
        $query = User::with('customer')
            ->selectRaw('customer_id, membership_tier_id as level, COUNT(id) as count')
            ->groupBy('customer_id', 'level')
            ->orderBy('customer_id', 'asc')
            ->orderBy('level', 'asc');

        $this->applyDateFilters($query, $filters, 'created_at');
        $this->applyCustomerFilters($query, $filters);

        $results = $query->get();

        return $results->map(function ($item) {
            return [
                'customer_id' => $item->customer_id,
                'customer_name' => optional($item->customer)->company_name ?? '',
                'level' => $item->level,
                'count' => (int) $item->count,
                'unit' => 'count',
            ];
        })->toArray();
    }

    /**
     * Get members by membership path
     */
    public function getMembersByPath(array $filters = []): array
    {
        $query = User::with('customer')
            ->selectRaw('customer_id, registration_path as path, COUNT(id) as count')
            ->groupBy('customer_id', 'path')
            ->orderBy('customer_id', 'asc')
            ->orderBy('path', 'asc');

        $this->applyDateFilters($query, $filters, 'created_at');
        $this->applyCustomerFilters($query, $filters);

        $results = $query->get();

        return $results->map(function ($item) {
            return [
                'customer_id' => $item->customer_id,
                'customer_name' => $item->customer?->company_name,
                'path' => $item->path,
                'count' => (int) $item->count,
                'unit' => 'count',
            ];
        })->toArray();
    }

    /**
     * Calculate summary statistics from existing data (no additional queries)
     */
    public function calculateSummary(array $statistics): array
    {
        $newMembers = $statistics['new_members'] ?? [];
        $withdrawnMembers = $statistics['withdrawn_members'] ?? [];
        $activeMembers = $statistics['active_members'] ?? [];
        $membersByLevel = $statistics['members_by_level'] ?? [];
        $membersByPath = $statistics['members_by_path'] ?? [];

        // Calculate total counts
        $totalNewMembers = array_sum(array_column($newMembers, 'count'));
        $totalWithdrawnMembers = array_sum(array_column($withdrawnMembers, 'count'));
        $totalActiveMembers = array_sum(array_column($activeMembers, 'count'));
        $totalMembersByLevel = array_sum(array_column($membersByLevel, 'count'));
        $totalMembersByPath = array_sum(array_column($membersByPath, 'count'));

        // Calculate average daily counts
        $uniqueDates = array_unique(array_merge(
            array_column($newMembers, 'date'),
            array_column($withdrawnMembers, 'date'),
            array_column($activeMembers, 'date')
        ));
        $totalDays = count($uniqueDates);

        $avgNewMembersPerDay = $totalDays > 0 ? round($totalNewMembers / $totalDays, 1) : 0;
        $avgWithdrawnMembersPerDay = $totalDays > 0 ? round($totalWithdrawnMembers / $totalDays, 1) : 0;
        $avgActiveMembersPerDay = $totalDays > 0 ? round($totalActiveMembers / $totalDays, 1) : 0;

        return [
            'total_new_members' => [
                'total' => $totalNewMembers,
                'unit' => 'count',
            ],
            'total_withdrawn_members' => [
                'total' => $totalWithdrawnMembers,
                'unit' => 'count',
            ],
            'total_active_members' => [
                'total' => $totalActiveMembers,
                'unit' => 'count',
            ],
            'total_members' => [
                'total' => $totalMembersByLevel,
                'unit' => 'count',
            ],
            'avg_new_members_per_day' => [
                'total' => $avgNewMembersPerDay,
                'unit' => 'count',
            ],
            'avg_withdrawn_members_per_day' => [
                'total' => $avgWithdrawnMembersPerDay,
                'unit' => 'count',
            ],
            'avg_active_members_per_day' => [
                'total' => $avgActiveMembersPerDay,
                'unit' => 'count',
            ],
            'net_growth' => [
                'total' => $totalNewMembers - $totalWithdrawnMembers,
                'unit' => 'count',
            ],
        ];
    }

    /**
     * Get comprehensive member statistics
     */
    public function getComprehensiveStatistics(array $filters = []): array
    {
        $newMembers = $this->getNewMembersByPeriod($filters);
        $withdrawnMembers = $this->getWithdrawnMembersByPeriod($filters);
        $activeMembers = $this->getActiveMembersByPeriod($filters);
        $membersByLevel = $this->getMembersByLevel($filters);
        $membersByPath = $this->getMembersByPath($filters);

        $statistics = [
            'new_members' => $newMembers,
            'withdrawn_members' => $withdrawnMembers,
            'active_members' => $activeMembers,
            'members_by_level' => $membersByLevel,
            'members_by_path' => $membersByPath,
        ];

        $statistics['summary'] = $this->calculateSummary($statistics);

        return $statistics;
    }

    /**
     * Apply date range filters to query
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     */
    protected function applyDateFilters($query, array $filters = [], string $dateColumn = 'created_at'): void
    {
        $startDate = Arr::get($filters, 'start_date');
        $endDate = Arr::get($filters, 'end_date');

        if ($startDate) {
            $query->whereDate($dateColumn, '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate($dateColumn, '<=', $endDate);
        }
    }

    /**
     * Apply customer filters to query
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     */
    protected function applyCustomerFilters($query, array $filters = []): void
    {
        $customerIds = Arr::get($filters, 'customer_ids');

        // Skip filtering if customer_ids is 'all' or empty
        if ($customerIds === 'all' || empty($customerIds)) {
            return;
        }

        if (is_array($customerIds) && count($customerIds) > 0) {
            $query->whereIn('customer_id', $customerIds);
        }
    }
}
