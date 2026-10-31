<?php

namespace App\Services\MyPage;

use App\Http\Resources\LimitManagementHistoryResource;
use App\Http\Resources\LimitManagementResource;
use App\Models\User;
use App\Models\UserLimit;
use App\Services\PaginationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class MypageLimitManagementService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    public function getLimit(User $user): LimitManagementResource
    {
        $limit = $user->limit()->first();

        if (! $limit) {
            return new LimitManagementResource(null);
        }

        return new LimitManagementResource($limit);
    }

    /**
     * Get paginated Limit with filters
     */
    public function getLimitHistory(User $user, array $filters = [], int $perPage = 15): array
    {
        try {
            $limit = $user->limit()->first();

            if (! $limit) {
                return [
                    'histories' => [],
                    'pagination' => $this->paginationService->formatEmpty($perPage),
                ];
            }

            $history = $this->loadHistory($filters, $perPage, $limit);

            return [
                'histories' => LimitManagementHistoryResource::collection($history->items()),
                'pagination' => $this->paginationService->format($history),
            ];
        } catch (\Exception $e) {
            Log::error('Get MyPage Limit History failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Load limit history
     */
    public function loadHistory(array $filters, int $perPage, UserLimit $userLimit): LengthAwarePaginator
    {
        $historyQuery = $userLimit->limitUsagedLogs()->filters($filters);

        // Paginate
        return $historyQuery->paginate($perPage);
    }
}
