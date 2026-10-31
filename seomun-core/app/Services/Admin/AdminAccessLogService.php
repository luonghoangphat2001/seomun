<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminAccessLogResource;
use App\Models\AccessLog;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;

class AdminAccessLogService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for access logs.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        // Get unique IP addresses for dropdown (limit to most recent 100 for performance).
        // MySQL: ORDER BY column not in SELECT is incompatible with DISTINCT; use GROUP BY + MAX(connection_time).
        $ipAddresses = AccessLog::query()
            ->whereNotNull('ip_address')
            ->select('ip_address')
            ->groupBy('ip_address')
            ->orderByRaw('MAX(connection_time) DESC')
            ->limit(100)
            ->pluck('ip_address')
            ->map(fn ($ip) => ['value' => $ip, 'label' => $ip])
            ->values()
            ->toArray();

        return [
            'event_type_options' => [
                ['value' => 'login', 'label' => 'Log In'],
                ['value' => 'logout', 'label' => 'Log Out'],
                ['value' => 'login_failed', 'label' => 'Login Failed'],
            ],
            'ip_address_options' => $ipAddresses,
        ];
    }

    /**
     * Get access logs with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getAccessLogs(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = AccessLog::query()->with('user');

        // Filter by login ID
        $loginId = Arr::get($filters, 'login_id');
        if ($loginId) {
            $query->byLoginId($loginId);
        }

        // Filter by IP address
        $ipAddress = Arr::get($filters, 'ip_address');
        if ($ipAddress) {
            $query->byIpAddress($ipAddress);
        }

        // Filter by event type
        $eventType = Arr::get($filters, 'event_type');
        if ($eventType) {
            $query->byEventType($eventType);
        }

        // Filter by browser information
        $browserInfo = Arr::get($filters, 'browser_info');
        if ($browserInfo) {
            $query->byBrowserInfo($browserInfo);
        }

        // Filter by access date range
        $accessDateFrom = Arr::get($filters, 'access_date_from');
        $accessDateTo = Arr::get($filters, 'access_date_to');
        if ($accessDateFrom || $accessDateTo) {
            $query->byDateRange($accessDateFrom, $accessDateTo);
        }

        // Filter by connection time range
        $connectionTimeFrom = Arr::get($filters, 'connection_time_from');
        $connectionTimeTo = Arr::get($filters, 'connection_time_to');
        if ($connectionTimeFrom) {
            $query->where('connection_time', '>=', $connectionTimeFrom);
        }
        if ($connectionTimeTo) {
            $query->where('connection_time', '<=', $connectionTimeTo);
        }

        // Detect abnormal attempts (multiple failed logins from same IP)
        $showAbnormalOnly = Arr::get($filters, 'show_abnormal_only', false);
        if ($showAbnormalOnly) {
            $query->where(function (Builder $q) {
                // Find IPs with multiple failed login attempts
                $failedIpAddresses = AccessLog::query()
                    ->where('event_type', 'login_failed')
                    ->select('ip_address')
                    ->groupBy('ip_address')
                    ->havingRaw('COUNT(*) >= 3') // 3 or more failed attempts
                    ->pluck('ip_address');

                if ($failedIpAddresses->isNotEmpty()) {
                    $q->whereIn('ip_address', $failedIpAddresses)
                        ->where('event_type', 'login_failed');
                } else {
                    // No results if no abnormal attempts found
                    $q->whereRaw('1 = 0');
                }
            });
        }

        // Sorting
        $sortBy = Arr::get($filters, 'sort_by', 'connection_time');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        // Map sort_by to actual column
        $sortColumn = match ($sortBy) {
            'login_id' => 'login_id',
            'ip_address' => 'ip_address',
            'connection_time' => 'connection_time',
            'access_date' => 'access_date',
            default => 'connection_time',
        };

        $query->orderBy($sortColumn, $sortOrder);

        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }
}
