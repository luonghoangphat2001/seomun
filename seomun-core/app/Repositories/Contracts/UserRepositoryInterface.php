<?php

namespace App\Repositories\Contracts;

interface UserRepositoryInterface
{
    public function getDailyMembers(array $filters): array;

    public function getWeeklyMembers(array $filters): array;

    public function getMembersAnalytics(array $filters = []): array;
}
