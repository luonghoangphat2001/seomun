<?php

namespace App\Repositories;

use App\Models\UserLimit;
use App\Repositories\Contracts\UserLimitRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserLimitRepository implements UserLimitRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return UserLimit::with('user', 'LimitUsagedLogs')->filters($filters)->paginate($perPage);
    }
}
