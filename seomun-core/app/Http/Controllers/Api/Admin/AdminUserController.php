<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserAuthority;
use App\Enums\UserStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\User\AdminChangePasswordRequest;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Requests\User\UserListRequest;
use App\Http\Resources\Admin\AdminUserResource;
use App\Models\User;
use App\Models\UserAdminPermission;
use App\Services\Admin\AdminUserService;
use App\Services\Admin\AdminUserPermissionService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends BaseController
{
    public function __construct(
        protected AdminUserService $adminUserService,
        protected PaginationService $paginationService
    ) {}

    public function searchFilters(): JsonResponse
    {
        $statusOptions = array_map(
            fn(UserStatus $s) => ['value' => $s->value, 'label' => $s->label()],
            UserStatus::cases()
        );

        $authorityOptions = array_map(
            fn(UserAuthority $a) => ['value' => $a->value, 'label' => $a->value],
            array_filter(UserAuthority::cases(), fn($a) => $a->isAdmin())
        );

        return response()->json([
            'success' => true,
            'data' => [
                'status_options' => $statusOptions,
                'authority_options' => array_values($authorityOptions),
            ],
        ]);
    }

    public function index(UserListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $users = $this->adminUserService->getUsers($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '사용자 목록이 성공적으로 조회되었습니다.', [
                'users' => AdminUserResource::collection($users->items()),
            ], $this->paginationService->format($users));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $user = $this->adminUserService->getUser($id);
            $user->load('adminPermissions');

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => new AdminUserResource($user),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $userAuth = $request->user();

            if (isset($validated['phone'])) {
                $validated['phone'] = preg_replace('/[^0-9]/', '', $validated['phone']);
            }
            if (isset($validated['mobile'])) {
                $validated['mobile'] = preg_replace('/[^0-9]/', '', $validated['mobile']);
            }

            $authority = isset($validated['authority'])
                ? UserAuthority::from($validated['authority'])
                : UserAuthority::SUPER_ADMIN;

            $user = DB::transaction(function () use ($validated, $authority, $userAuth) {
                $user = User::create([
                    'status' => UserStatus::ACTIVE,
                    'name' => $validated['name'],
                    'username' => $validated['username'],
                    'password' => Hash::make($validated['password']),
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? null,
                    'mobile' => $validated['mobile'] ?? null,
                    'postcode' => $validated['postcode'] ?? null,
                    'address' => $validated['address'] ?? null,
                    'detailed_address' => $validated['detailed_address'] ?? null,
                    'authority' => $authority,
                    'headquarters' => $validated['headquarters'] ?? null,
                    'business_office' => $validated['business_office'] ?? null,
                    'team' => $validated['team'] ?? null,
                    'position' => $validated['position'] ?? null,
                    'department' => $validated['department'] ?? null,
                    'hire_date' => $validated['hire_date'] ?? null,
                    'resignation_date' => $validated['resignation_date'] ?? null,
                    'bank_name' => $validated['bank_name'] ?? null,
                    'account_number' => $validated['account_number'] ?? null,
                    'agree_privacy' => true,
                    'agree_terms' => true,
                    'agree_sms' => true,
                    'agree_email' => true,
                    'agreed_at' => now(),
                ]);

                if (isset($validated['admin_permission_ids'])) {
                    foreach ($validated['admin_permission_ids'] as $permissionId) {
                        UserAdminPermission::create([
                            'user_id' => $user->id,
                            'admin_permission_id' => $permissionId,
                            'status' => 'active',
                            'grant_date' => now(),
                            'created_by' => $userAuth->id,
                        ]);
                    }
                }

                return $user->load('adminPermissions');
            });

            return response()->json([
                'success' => true,
                'message' => '관리자가 등록되었습니다.',
                'data' => [
                    'user' => new AdminUserResource($user),
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => '관리자 등록 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateUserRequest $request, int|string $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $validated = $request->validated();
            $authUser = $request->user();

            if (empty($validated)) {
                return response()->json([
                    'success' => false,
                    'message' => '수정할 유효한 데이터가 없습니다.',
                ], 422);
            }

            $user->update($validated);

            if (isset($validated['admin_permission_ids'])) {
                // Delete existing permissions and sync with new ones
                UserAdminPermission::where('user_id', $user->id)->forcedelete();

                foreach ($validated['admin_permission_ids'] as $permissionId) {
                    UserAdminPermission::create([
                        'user_id' => $user->id,
                        'admin_permission_id' => $permissionId,
                        'status' => 'active',
                        'grant_date' => now(),
                        'created_by' => $authUser->id,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => '관리자가 수정되었습니다.',
                'data' => [
                    'user' => new AdminUserResource($user->fresh()->load('adminPermissions')),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => '관리자 수정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            if ($user->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => '본인 계정은 삭제할 수 없습니다.',
                ], 422);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => '관리자가 삭제되었습니다.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => '관리자 삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function changePassword(AdminChangePasswordRequest $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $user->update(['password' => Hash::make($request->validated('password'))]);

            return response()->json([
                'success' => true,
                'message' => '비밀번호가 변경되었습니다.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => '비밀번호 변경 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
