<?php

namespace App\Repositories;

use App\Models\Review;
use App\Repositories\Contracts\ReviewRepositoryInterface;

class ReviewRepository implements ReviewRepositoryInterface
{
    public function __construct(protected Review $review) {}

    public function getReviewsAnalytics(array $filters = []): array
    {
        $currentFilters = [
            'start_date' => $filters['start_date'],
            'end_date' => $filters['end_date'],
            'customer_ids' => $filters['customer_ids'] ?? [],
        ];

        $queryCurrent = $this->review->published()
            ->selectRaw("COUNT(*) as total, 'curr' as period")
            ->filters($currentFilters);

        $previousFilters = [
            'start_date' => $filters['previous_start_date'],
            'end_date' => $filters['previous_end_date'],
            'customer_ids' => $filters['customer_ids'] ?? [],
        ];

        $queryPrevious = $this->review->published()
            ->selectRaw("COUNT(*) as total, 'prev' as period")
            ->filters($previousFilters);

        $result = $queryCurrent->union($queryPrevious)->get();

        return $result->keyBy('period')->toArray();
    }

    public function getDataDaily(array $filters = []): array
    {
        return $this->review->published()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->filters($filters)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    public function getDataWeekly(array $filters = []): array
    {
        return $this->review->published()
            ->selectRaw('YEARWEEK(created_at, 1) as week, MIN(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY)) as date, COUNT(*) as total')
            ->filters($filters)
            ->groupBy('week')
            ->orderBy('week')
            ->get()
            ->toArray();
    }
}