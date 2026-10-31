<?php

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserLimitRepositoryInterface
{
    /**
     * Get paginated user limits with optional filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;
}
