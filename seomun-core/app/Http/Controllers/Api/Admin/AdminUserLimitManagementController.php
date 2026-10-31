<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\UserLimit\StoreAdminUserLimitRequest;
use App\Http\Requests\Admin\UserLimit\UpdateAdminUserLimitRequest;
use App\Http\Resources\Admin\AdminUserLimitResource;
use App\Http\Resources\LimitManagementHistoryResource;
use App\Models\UserLimit;
use App\Services\Admin\AdminUserLimitManagementService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserLimitManagementController extends BaseController
{
    public function __construct(public AdminUserLimitManagementService $adminUserLimitManagementService, public PaginationService $paginationService) {}

    /**
     *  Get list user limit
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->all();

        try {
            $userLimit = $this->adminUserLimitManagementService->getPaginated($filters);

            return $this->responsePaginatedSuccess(200, '사용자 한도 목록이 성공적으로 조회되었습니다.', [
                'limit' => AdminUserLimitResource::collection($userLimit),
            ], $this->paginationService->format($userLimit));
        } catch (\Throwable $th) {
            return $this->responseError(500, '사용자 한도 목록 조회에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    /**
     * Add user limit
     *
     * @return JsonResponse
     */
    public function store(StoreAdminUserLimitRequest $request)
    {
        $data = $request->validated();

        try {
            $userLimit = UserLimit::create($data);

            return $this->responseSuccess(201, '사용자 한도가 성공적으로 생성되었습니다.', [
                'limit' => new AdminUserLimitResource($userLimit->loadMissing('user')),
            ]);
        } catch (\Throwable $th) {
            return $this->responseError(500, '사용자 한도 생성에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    /**
     * Get detail limit
     */
    public function show(UserLimit $userLimit): JsonResponse
    {
        try {
            return $this->responseSuccess(200, '사용자 한도 상세 정보가 성공적으로 조회되었습니다.', [
                'limit' => new AdminUserLimitResource($userLimit->loadMissing('user')),
            ]);
        } catch (\Throwable $th) {
            return $this->responseError(500, '사용자 한도 상세 조회에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    /**
     * Update user limit
     *
     * @param  StoreAdminUserLimitRequest  $request
     */
    public function update(UpdateAdminUserLimitRequest $request, UserLimit $userLimit): JsonResponse
    {
        try {
            $data = $request->validated();

            if ($userLimit->usage_amount > 0) {
                return $this->responseError(400, '사용자 한도 수정에 실패하였습니다.', ['사용 금액이 한도를 초과하였습니다.']);
            }

            if ($userLimit->fill($data)->isDirty()) {
                $userLimit->update($data);
            }

            return $this->responseSuccess(200, '사용자 한도가 성공적으로 수정되었습니다.', [
                'limit' => new AdminUserLimitResource($userLimit->loadMissing('user')),
            ]);
        } catch (\Throwable $th) {
            return $this->responseError(500, '사용자 한도 수정에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    /**
     * Delete user limit
     */
    public function destroy(int $userLimitId): JsonResponse
    {
        try {
            $userLimit = UserLimit::findOrFail($userLimitId);

            // if ($userLimit->usage_amount > 0) {
            //     return $this->responseError(400, '사용자 한도 삭제에 실패하였습니다.', ['사용 금액이 한도를 초과하였습니다.']);
            // }

            $userLimit->forceDelete();

            return $this->responseSuccess(200, '사용자 한도가 성공적으로 삭제되었습니다.');
        } catch (\Throwable $th) {
            return $this->responseError(500, '사용자 한도 삭제에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    /**
     * Get detail history of limit
     */
    public function history(Request $request, UserLimit $userLimit): JsonResponse
    {
        try {
            // load limit usaged logs with paginate
            $perPage = config('app.paginate.per_page');
            $filters = $request->all();
            $limitUsagedLogs = $userLimit->limitUsagedLogs()->filters($filters)->paginate($perPage);

            return $this->responsePaginatedSuccess(200, '한도 사용 내역이 성공적으로 조회되었습니다.', [
                'history' => LimitManagementHistoryResource::collection($limitUsagedLogs),
            ], $this->paginationService->format($limitUsagedLogs));
        } catch (\Throwable $th) {
            return $this->responseError(500, '한도 사용 내역 조회에 실패하였습니다.', [$th->getMessage()]);
        }
    }
}
