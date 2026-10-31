<?php

namespace App\Http\Filters\Admin;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class LimitUsagedLogsFilter
{
    /**
     * Apply filters to the query
     */
    public function apply(Builder $query, array $filters): Builder
    {
        $sortField = $this->validateSortField($filters['sort_by'] ?? null);
        $sortDirection = $this->validateSortDirection($filters['sort_order'] ?? null);

        $query
            ->when(isset($filters['start_day']), function ($query) use ($filters) {
                $startDay = Carbon::parse($filters['start_day'])->startOfDay();
                $query->where('created_at', '>=', $startDay);
            })
            ->when(isset($filters['end_day']), function ($query) use ($filters) {
                $endDay = Carbon::parse($filters['end_day'])->endOfDay();
                $query->where('created_at', '<=', $endDay);
            });
        $query->orderBy($sortField, $sortDirection);

        return $query;
    }

    /**
     * Get sort field
     *
     * @param  mixed  $field
     */
    private function validateSortField(?string $field): string
    {
        if (! $field) {
            return 'created_at';
        }

        return $field;
    }

    /**
     * Get sort direction
     *
     * @param  mixed  $direction
     */
    private function validateSortDirection(?string $direction): string
    {
        if (! $direction) {
            return 'desc';
        }

        return $direction;
    }
}
