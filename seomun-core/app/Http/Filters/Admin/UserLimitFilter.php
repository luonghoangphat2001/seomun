<?php

namespace App\Http\Filters\Admin;

use Illuminate\Database\Eloquent\Builder;

class UserLimitFilter
{
    /**
     * Apply filters to the query
     */
    public function apply(Builder $query, array $filters): Builder
    {
        $sortField = $this->validateSortField($filters['sort_by'] ?? null);
        $sortDirection = $this->validateSortDirection($filters['sort_order'] ?? null);

        $query
            ->when(isset($filters['name']), function ($query) use ($filters) {
                $query->whereHas('user', function ($query) use ($filters) {
                    $query->where('name', 'like', '%'.$filters['name'].'%');
                });
            })
            ->when(isset($filters['status']), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
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
