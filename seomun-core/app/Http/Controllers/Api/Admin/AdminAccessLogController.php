<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\AccessLog\AdminAccessLogListRequest;
use App\Http\Resources\Admin\AdminAccessLogResource;
use App\Services\Admin\AdminAccessLogService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminAccessLogController extends BaseController
{
    public function __construct(
        protected AdminAccessLogService $adminAccessLogService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get search filter options for access logs.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminAccessLogService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get list of access logs for Super Admin.
     */
    public function index(AdminAccessLogListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminAccessLogService->getAccessLogs($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '접속 로그 목록이 성공적으로 조회되었습니다.', [
                'access_logs' => AdminAccessLogResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
