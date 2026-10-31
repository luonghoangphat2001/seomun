<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Permission\AdminPermissionAssignUsersRequest;
use App\Http\Requests\Admin\Permission\AdminPermissionCopyRequest;
use App\Http\Requests\Admin\Permission\AdminPermissionListRequest;
use App\Http\Requests\Admin\Permission\AdminPermissionSettingsRequest;
use App\Http\Requests\Admin\Permission\AdminPermissionStoreRequest;
use App\Http\Requests\Admin\Permission\AdminPermissionUpdateRequest;
use App\Http\Resources\Admin\AdminPermissionResource;
use App\Http\Resources\Admin\AdminUserPermissionResource;
use App\Http\Resources\Admin\AdminUserResource;
use App\Services\Admin\AdminPermissionService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPermissionController extends BaseController
{
    public function __construct(
        protected AdminPermissionService $adminPermissionService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get menu structure (settings) for an administrator permission by its id.
     * Authority name is like a username; each permission has an id. To get or update its setting (menu_permissions),
     * the client sends the permission id. Returns the hierarchical menu structure with checked state from this permission's saved settings.
     * Optional query: branch (menu id, e.g. member_management, member_list) to return only that branch.
     */
    public function menuStructure(int $id): JsonResponse
    {
        try {
            $permission = $this->adminPermissionService->getPermission($id);
            $existingPermissions = $permission->menu_permissions ?? [];
            $branchId = request()->query('branch');
            $branchId = $branchId !== null && $branchId !== '' ? (string) $branchId : null;

            $menuStructure = $this->adminPermissionService->getMenuStructure($existingPermissions, $branchId);

            $attachedMenus = array_flip(array_column($existingPermissions ?? [], 'menu'));
            $menuIndex = 0;
            $groups = array_values(array_map(function ($group, $groupIndex) use (&$menuIndex, $attachedMenus) {
                return [
                    'id' => $groupIndex + 1,
                    'key' => $group['id'],
                    'name' => $group['name']['label']['en'] ?? $group['id'],
                    'sort_order' => ($groupIndex + 1) * 10,
                    'menus' => array_values(array_map(function ($menu) use (&$menuIndex, $attachedMenus) {
                        $menuIndex++;
                        return [
                            'id' => $menuIndex,
                            'key' => $menu['id'],
                            'name' => $menu['name']['label']['en'] ?? $menu['id'],
                            'show_in_navigation' => isset($attachedMenus[$menu['id']]),
                        ];
                    }, $group['menus'])),
                ];
            }, $menuStructure, array_keys($menuStructure)));

            return $this->responseSuccess(200, '권한 메뉴 설정이 성공적으로 조회되었습니다.', [
                'permission' => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'code' => $permission->code,
                ],
                'groups' => $groups,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get search filter options for admin permissions.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminPermissionService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get list of administrator permissions for Super Admin.
     *
     * All query parameters are optional. Single search box: searches by authority name (permission name) or registrant (username, name, email).
     *
     * Query parameters:
     * - search: Combined search keyword; searches by authority name or registrant (username, name, email)
     * - usage_status: Filter by usage status (active, inactive)
     * - sort_by: Sort field (name, created_at, usage_status) - default: created_at
     * - sort_order: Sort direction (asc, desc) - default: desc
     * - per_page: Items per page (1-100) - default: 20
     */
    public function index(AdminPermissionListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            // Ensure per_page is within valid range
            $perPage = max(1, min($perPage, 100));

            $paginator = $this->adminPermissionService->getPermissions($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '권한 목록이 성공적으로 조회되었습니다.', [
                'permissions' => AdminPermissionResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single administrator permission detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $permission = $this->adminPermissionService->getPermission($id);

            return $this->responseSuccess(200, '권한이 성공적으로 조회되었습니다.', [
                'permission' => new AdminPermissionResource($permission),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Register a new administrator permission.
     */
    public function store(AdminPermissionStoreRequest $request): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $permission = $this->adminPermissionService->createPermission($adminUser, $data);

            return $this->responseSuccess(201, '권한이 성공적으로 생성되었습니다.', [
                'permission' => new AdminPermissionResource($permission->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update administrator permission.
     */
    public function update(AdminPermissionUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $permission = $this->adminPermissionService->updatePermission($id, $data);

            return $this->responseSuccess(200, '권한이 성공적으로 수정되었습니다.', [
                'permission' => new AdminPermissionResource($permission->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete administrator permission.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminPermissionService->deletePermission($id);

            return $this->responseSuccess(200, '권한이 성공적으로 삭제되었습니다.');
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Copy administrator permission.
     */
    public function copy(AdminPermissionCopyRequest $request, int $id): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $permission = $this->adminPermissionService->copyPermission($id, $adminUser, $data);

            return $this->responseSuccess(201, '권한이 성공적으로 복사되었습니다.', [
                'permission' => new AdminPermissionResource($permission->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update menu permissions (settings) for an administrator permission by id.
     * Same as "update setting of this authority (permission id)". Request body: menu_permissions array.
     * Response includes the updated permission (with menu_permissions). FE can also GET {id}/menu-structure to retrieve the updated setting.
     */
    public function updateSettings(AdminPermissionSettingsRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $permission = $this->adminPermissionService->updateMenuPermissions($id, $data);

            return $this->responseSuccess(200, '권한 설정이 성공적으로 저장되었습니다.', [
                'permission' => new AdminPermissionResource($permission->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get users assigned to a permission with pagination.
     */
    public function users(Request $request, int $id): JsonResponse
    {
        try {
            $filters = $request->only(['keyword', 'current_page', 'page']);
            $perPage = (int) ($request->query('per_page', 20));
            $perPage = max(1, min($perPage, 100));

            $paginator = $this->adminPermissionService->getUsersByPermission($id, $filters, $perPage);

            return $this->responsePaginatedSuccess(200, '사용자 목록이 성공적으로 조회되었습니다.', [
                'users' => AdminUserPermissionResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Add users to a permission.
     */
    public function addUsers(AdminPermissionAssignUsersRequest $request, int $id): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $result = $this->adminPermissionService->addUsersToPermission($id, $data['user_ids'], $adminUser);

            $message = '사용자가 성공적으로 추가되었습니다.';
            if (! empty($result['skipped'])) {
                $message .= ' 일부 사용자는 이미 할당되어 있어 건너뛰었습니다.';
            }

            return $this->responseSuccess(200, $message, $result);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Remove users from a permission.
     */
    public function removeUsers(AdminPermissionAssignUsersRequest $request, int $id): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $removedCount = $this->adminPermissionService->removeUsersFromPermission($id, $data['user_ids'], $adminUser);

            return $this->responseSuccess(200, '사용자가 성공적으로 제거되었습니다.', [
                'removed_count' => $removedCount,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get users NOT assigned to a permission with pagination.
     */
    public function availableUsers(Request $request, int $id): JsonResponse
    {
        try {
            $filters = $request->only(['keyword', 'current_page', 'page']);
            $perPage = (int) ($request->query('per_page', 20));
            $perPage = max(1, min($perPage, 100));

            $paginator = $this->adminPermissionService->getAvailableUsersByPermission($id, $filters, $perPage);

            return $this->responsePaginatedSuccess(200, '사용 가능한 사용자 목록이 성공적으로 조회되었습니다.', [
                'users' => AdminUserResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
