<?php

namespace App\Services\Admin;

use App\Enums\UserAuthority;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AdminUserService
{
    /**
     * Get users with filters & pagination
     */
    public function getUsers(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = User::query()
            ->whereIn('authority', [UserAuthority::SUPER_ADMIN->value, UserAuthority::STORE_ADMIN->value]);

        if (! empty($filters['search_term'])) {
            $search = $filters['search_term'];

            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', UserStatus::from($filters['status']));
        }

        if (! empty($filters['authority'])) {
            $query->where('authority', $filters['authority']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    public function getUser(string $id): User
    {
        $query = User::query();

        $user = $query->where('id', $id)->first();

        if (! $user) {
            throw new ModelNotFoundException('User not found.');
        }

        return $user;
    }
}
