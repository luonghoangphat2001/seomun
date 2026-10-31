<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminUserPermissionResource;
use App\Models\AdminPermission;
use App\Models\User;
use App\Models\UserAdminPermission;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminUserPermissionService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Build base query for user permissions with optional filters.
     * This method is reused by listing and Excel export.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = UserAdminPermission::query()
            ->with(['user.customer', 'adminPermission', 'createdBy']);

        $customer = Arr::get($filters, 'customer');
        if ($customer) {
            $query->whereHas('user.customer', function (Builder $customerQuery) use ($customer) {
                $customerQuery->where('company_name', 'like', '%'.$customer.'%');
            });
        }

        $authority = Arr::get($filters, 'authority');
        if ($authority) {
            $query->whereHas('adminPermission', function (Builder $builder) use ($authority) {
                $builder->where('name', 'like', '%'.$authority.'%');
            });
        }

        // Backward-compatible combined search: customer OR authority OR user (username/name/email)
        $search = Arr::get($filters, 'search');
        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->whereHas('user.customer', function (Builder $customerQuery) use ($search) {
                    $customerQuery->where('company_name', 'like', '%'.$search.'%');
                })
                    ->orWhereHas('adminPermission', function (Builder $builder) use ($search) {
                        $builder->where('name', 'like', '%'.$search.'%');
                    })
                    ->orWhereHas('user', function (Builder $builder) use ($search) {
                        $builder->where('username', 'like', '%'.$search.'%')
                            ->orWhere('name', 'like', '%'.$search.'%')
                            ->orWhere('email', 'like', '%'.$search.'%');
                    });
            });
        }

        // Filter by status (active/inactive)
        $status = Arr::get($filters, 'status');
        if ($status) {
            $query->where('status', $status);
        }

        $sortBy = Arr::get($filters, 'sort_by', 'grant_date');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $query->orderBy($sortBy, $sortOrder);

        return $query;
    }

    /**
     * Get user permissions with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getUserPermissions(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);

        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Get single user permission detail.
     */
    public function getUserPermission(int $id): UserAdminPermission
    {
        return UserAdminPermission::with(['user.customer', 'adminPermission', 'createdBy'])
            ->findOrFail($id);
    }

    /**
     * Create a new user permission.
     *
     * @param  array<string, mixed>  $data
     */
    public function createUserPermission(User $adminUser, array $data): UserAdminPermission
    {
        return DB::transaction(function () use ($adminUser, $data) {

            // Ensure target user & permission exist
            $targetUser = User::findOrFail($data['user_id']);
            $adminPermission = AdminPermission::findOrFail($data['admin_permission_id']);

            $userAdminPermission = UserAdminPermission::create([
                'user_id' => $targetUser->id,
                'admin_permission_id' => $adminPermission->id,
                'status' => $data['status'],
                'grant_date' => now(),
                'created_by' => $adminUser->id,
            ]);

            if (! $userAdminPermission) {
                throw new \InvalidArgumentException('Failed to create user admin permission.');
            }

            return $userAdminPermission;
        });
    }

    /**
     * Update an existing user permission.
     * Route {id} is UserAdminPermission id.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateUserPermission(User $adminUser, int $id, array $data): UserAdminPermission
    {
        return DB::transaction(function () use ($id, $data) {
            $userAdminPermission = UserAdminPermission::query()->findOrFail($id);
            $updates = [];

            if (isset($data['admin_permission_id'])) {
                // Change linked authority
                $adminPermission = AdminPermission::findOrFail($data['admin_permission_id']);
                $updates['admin_permission_id'] = $adminPermission->id;
            }

            if (array_key_exists('status', $data)) {
                $updates['status'] = $data['status'];
            }

            if ($updates !== []) {
                $userAdminPermission->update($updates);
            }

            return $userAdminPermission->load(['user.customer', 'adminPermission', 'createdBy']);
        });
    }

    /**
     * Delete a user permission.
     */
    public function deleteUserPermission(int $id): void
    {
        DB::transaction(function () use ($id) {
            $userPermission = UserAdminPermission::findOrFail($id);
            $userPermission->delete();
        });
    }

    /**
     * Format list response with pagination and resources.
     *
     * @return array<string, mixed>
     */
    public function formatListResponse(LengthAwarePaginator $paginator): array
    {
        return [
            'user_permissions' => AdminUserPermissionResource::collection($paginator->items()),
            'pagination' => $this->paginationService->format($paginator),
        ];
    }
}
