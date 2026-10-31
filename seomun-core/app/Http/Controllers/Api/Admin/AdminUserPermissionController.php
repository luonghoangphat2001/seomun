<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\UserPermission\AdminUserPermissionListRequest;
use App\Http\Requests\Admin\UserPermission\AdminUserPermissionStoreRequest;
use App\Http\Requests\Admin\UserPermission\AdminUserPermissionUpdateRequest;
use App\Http\Resources\Admin\AdminUserPermissionResource;
use App\Services\Admin\AdminUserPermissionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class AdminUserPermissionController extends BaseController
{
    public function __construct(
        protected AdminUserPermissionService $adminUserPermissionService
    ) {}

    /**
     * Get list of user permissions for Super Admin.
     */
    public function index(AdminUserPermissionListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminUserPermissionService->getUserPermissions($filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => $this->adminUserPermissionService->formatListResponse($paginator),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single user permission detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $userPermission = $this->adminUserPermissionService->getUserPermission($id);

            return $this->responseSuccess(200, '사용자 권한이 성공적으로 조회되었습니다.', [
                'user_permission' => new AdminUserPermissionResource($userPermission),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Register a new user permission.
     */
    public function store(AdminUserPermissionStoreRequest $request): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $userPermission = $this->adminUserPermissionService->createUserPermission($adminUser, $data);

            return $this->responseSuccess(201, '사용자 권한이 성공적으로 생성되었습니다.', [
                'user_permission' => new AdminUserPermissionResource(
                    $userPermission->load(['user.customer', 'adminPermission', 'createdBy'])
                ),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update user permission.
     */
    public function update(AdminUserPermissionUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $userPermission = $this->adminUserPermissionService->updateUserPermission($adminUser, $id, $data);

            return $this->responseSuccess(200, '사용자 권한이 성공적으로 수정되었습니다.', [
                'user_permission' => new AdminUserPermissionResource(
                    $userPermission->load(['user.customer', 'adminPermission', 'createdBy'])
                ),
            ]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '사용자 권한을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete user permission.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminUserPermissionService->deleteUserPermission($id);

            return $this->responseSuccess(200, '사용자 권한이 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
