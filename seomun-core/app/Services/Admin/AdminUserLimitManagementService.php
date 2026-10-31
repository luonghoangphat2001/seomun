<?php

namespace App\Services\Admin;

use App\Repositories\Contracts\UserLimitRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminUserLimitManagementService
{
    const PER_PAGE = 15;

    public function __construct(public UserLimitRepositoryInterface $userLimitRepo) {}

    /**
     * Get paginated user limits with optional filters
     */
    public function getPaginated(array $filters = [], int $perPage = self::PER_PAGE): LengthAwarePaginator
    {
        return $this->userLimitRepo->getPaginated($filters, $perPage);
    }
}
