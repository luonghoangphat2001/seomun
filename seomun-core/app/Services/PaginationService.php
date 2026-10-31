<?php

namespace App\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PaginationService
{
    /**
     * Format pagination response
     *
     * @return array<string, mixed>
     */
    public function format(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total_page' => $paginator->lastPage(),
            'total_item' => $paginator->total(),
        ];
    }

    /**
     * Format empty pagination response (when no data)
     *
     * @return array<string, mixed>
     */
    public function formatEmpty(int $perPage = 15): array
    {
        return [
            'current_page' => 1,
            'per_page' => $perPage,
            'total_page' => 0,
            'total_item' => 0,
        ];
    }
}
