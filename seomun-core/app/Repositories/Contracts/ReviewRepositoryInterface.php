<?php

namespace App\Repositories\Contracts;

interface ReviewRepositoryInterface
{
    public function getReviewsAnalytics(array $filters = []): array;

    public function getDataDaily(array $filters = []): array;

    public function getDataWeekly(array $filters = []): array;
}