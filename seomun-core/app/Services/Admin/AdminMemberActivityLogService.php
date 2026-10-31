<?php

namespace App\Services\Admin;

use App\Models\AccessLog;
use App\Models\Order;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Spatie\Activitylog\Models\Activity;

class AdminMemberActivityLogService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get activity logs for a member (user).
     * Includes: recent logins, recent orders, information modifications.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getActivityLogs(int|string $memberId, array $filters = [], int $perPage = 20): array
    {
        $member = User::findOrFail($memberId);

        $result = [
            'recent_logins' => $this->getRecentLogins($member, $filters, 10), // Last 10 logins
            'recent_orders' => $this->getRecentOrders($member, $filters, 10), // Last 10 orders
            'information_modifications' => $this->getInformationModifications($member, $filters, $perPage),
        ];

        return $result;
    }

    /**
     * Get recent login history for a member.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    protected function getRecentLogins(User $member, array $filters, int $limit = 10): array
    {
        $query = AccessLog::query()
            ->where('user_id', $member->id)
            ->whereIn('event_type', ['login', 'logout'])
            ->orderBy('connection_time', 'desc')
            ->limit($limit);

        // Filter by date range
        $dateFrom = Arr::get($filters, 'login_date_from');
        $dateTo = Arr::get($filters, 'login_date_to');
        if ($dateFrom) {
            $query->whereDate('connection_time', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('connection_time', '<=', $dateTo);
        }

        return $query->get()->map(function ($log) {
            return [
                'id' => $log->id,
                'event_type' => $log->event_type,
                'event_type_label' => match ($log->event_type) {
                    'login' => 'Log In',
                    'logout' => 'Log Out',
                    default => ucfirst($log->event_type),
                },
                'ip_address' => $log->ip_address,
                'browser_info' => $log->browser_info,
                'connection_time' => $log->connection_time?->format('Y-m-d H:i:s'),
            ];
        })->toArray();
    }

    /**
     * Get recent order history for a member.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    protected function getRecentOrders(User $member, array $filters, int $limit = 10): array
    {
        $query = Order::query()
            ->where('user_id', $member->id)
            ->orderBy('placed_at', 'desc')
            ->limit($limit);

        // Filter by date range
        $dateFrom = Arr::get($filters, 'order_date_from');
        $dateTo = Arr::get($filters, 'order_date_to');
        if ($dateFrom) {
            $query->whereDate('placed_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('placed_at', '<=', $dateTo);
        }

        return $query->get()->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'total_amount' => $order->total_amount,
                'placed_at' => $order->placed_at?->format('Y-m-d H:i:s'),
            ];
        })->toArray();
    }

    /**
     * Get information modification history for a member.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function getInformationModifications(User $member, array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Activity::query()
            ->where('subject_type', User::class)
            ->where('subject_id', $member->id)
            ->where('event', 'updated')
            ->with('causer')
            ->orderBy('created_at', 'desc');

        // Filter by date range
        $dateFrom = Arr::get($filters, 'modification_date_from');
        $dateTo = Arr::get($filters, 'modification_date_to');
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return $query->paginate($perPage);
    }

    /**
     * Format activity logs response.
     *
     * @param  array<string, mixed>  $activityLogs
     * @return array<string, mixed>
     */
    public function formatResponse(array $activityLogs): array
    {
        return [
            'recent_logins' => $activityLogs['recent_logins'],
            'recent_orders' => $activityLogs['recent_orders'],
            'information_modifications' => [
                'logs' => $this->formatModificationLogs($activityLogs['information_modifications']->items()),
                'pagination' => $this->paginationService->format($activityLogs['information_modifications']),
            ],
        ];
    }

    /**
     * Format modification logs.
     *
     * @param  array<int, Activity>  $activities
     * @return array<int, array<string, mixed>>
     */
    protected function formatModificationLogs(array $activities): array
    {
        return array_map(function ($activity) {
            $oldValues = $activity->properties['old'] ?? [];
            $newValues = $activity->properties['attributes'] ?? [];

            // Filter out 'updated_at' from changes
            $changes = array_diff_assoc($newValues, $oldValues);
            unset($changes['updated_at']);

            return [
                'id' => $activity->id,
                'modified_at' => $activity->created_at->format('Y-m-d H:i:s'),
                'modified_by' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'username' => $activity->causer->username,
                    'name' => $activity->causer->name,
                    'email' => $activity->causer->email,
                ] : null,
                'fields' => [
                    'before' => $oldValues,
                    'after' => $newValues,
                    'changes' => $changes,
                ],
                'description' => $activity->description,
            ];
        }, $activities);
    }
}
