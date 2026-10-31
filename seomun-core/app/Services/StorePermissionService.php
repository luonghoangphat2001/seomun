<?php

namespace App\Services;

use App\Enums\StorePermissionType;
use App\Http\Resources\StorePermissionResource;
use App\Models\StorePermission;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StorePermissionService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    public function createStorePermission(User $user, array $data): StorePermissionResource
    {
        try {
            DB::beginTransaction();

            $storePermission = StorePermission::create([
                'name' => $data['name'],
                'permission_scope' => $data['permission_scope'],
                'permission_type' => $data['permission_type'],
                'notes' => $data['notes'] ?? null,
            ]);

            DB::commit();

            return new StorePermissionResource($storePermission);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create StorePermission failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function getStorePermissions(User $user, ?string $search, ?string $searchOption, int $perPage = 15): array
    {
        try {
            $query = StorePermission::query();

            if ($search) {
                $query->where(function ($q) use ($search, $searchOption) {
                    if ($searchOption == 'permission_name') {
                        $q->where('name', 'like', '%'.$search.'%');
                    }
                    if ($searchOption == 'permission_type') {
                        $matchedValues = StorePermissionType::valuesByKeyword($search);
                        foreach ($matchedValues as $value) {
                            $q->orWhereJsonContains('permission_type', $value);
                        }
                    }
                });
            }

            $storePermissions = $query->paginate($perPage);

            return [
                'userPermission' => StorePermissionResource::collection($storePermissions->items()),
                'pagination' => $this->paginationService->format($storePermissions),
            ];
        } catch (\Exception $e) {
            Log::error('Get StorePermission failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function getStorePermissionDetail(User $user, int $id): StorePermissionResource
    {
        try {
            $storePermission = StorePermission::query()
                ->findOrFail($id);

            return new StorePermissionResource($storePermission);
        } catch (\Exception $e) {
            Log::error('Get StorePermission detail failed', [
                'user_id' => $user->id,
                'store_permission_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function updateStorePermission(User $user, int $id, array $data): StorePermissionResource
    {
        try {
            $storePermission = StorePermission::query()->findOrFail($id);

            DB::beginTransaction();

            $updatedUserPermission = [
                'name' => $data['name'],
                'permission_scope' => $data['permission_scope'],
                'permission_type' => $data['permission_type'],
                'notes' => $data['notes'] ?? null,
            ];

            $storePermission->update($updatedUserPermission);
            DB::commit();

            return new StorePermissionResource($storePermission);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update StorePermission failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function deleteStorePermission(User $user, int $id): bool
    {
        try {
            $userPermission = StorePermission::query()->findOrFail($id);

            return $userPermission->delete();
        } catch (\Exception $e) {
            Log::error('Update StorePermission failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
