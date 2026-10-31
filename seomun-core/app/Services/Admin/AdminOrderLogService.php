<?php

namespace App\Services\Admin;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Spatie\Activitylog\Models\Activity;

class AdminOrderLogService
{
    /**
     * Get modification logs for order basic information.
     */
    public function getModificationLogs(string $orderNumber, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Activity::query()
            ->with('causer')
            ->where('subject_type', Order::class)
            ->whereHas('subject', function ($q) use ($orderNumber) {
                $q->where('order_number', $orderNumber);
            });

        // Only logs where basic info fields changed (exclude pure status-only logs for this endpoint)
        $query->where(function ($q) {
            $q->whereJsonContains('properties->attributes->company_name', '%%')
                ->orWhereJsonContains('properties->attributes->contact_name', '%%')
                ->orWhereJsonContains('properties->attributes->shipping_address', '%%')
                ->orWhereJsonContains('properties->attributes->payment_method', '%%');
        });

        // Date range
        if ($from = Arr::get($filters, 'date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = Arr::get($filters, 'date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $query->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }

    /**
     * Get status history logs for order.
     */
    public function getStatusHistory(string $orderNumber, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Activity::query()
            ->with('causer')
            ->where('subject_type', Order::class)
            ->where('event', 'updated')
            ->whereHas('subject', function ($q) use ($orderNumber) {
                $q->where('order_number', $orderNumber);
            })
            // ensure status field is present in properties
            ->whereNotNull('properties->old->status');

        if ($from = Arr::get($filters, 'date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = Arr::get($filters, 'date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $query->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }
}
