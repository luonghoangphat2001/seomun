<?php

namespace App\Services;

use App\Models\Popup;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class PopupService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get active/visible popups for the current user or guest.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPopups(?User $user, array $filters = []): LengthAwarePaginator|Collection
    {
        $query = $this->buildVisibleQuery($user);

        // Filter by exposure location (supports exposure_location or location)
        $location = $filters['exposure_location'] ?? $filters['location'] ?? null;
        if (!empty($location)) {
            $query->where('exposure_location', $location);
        }

        $query->orderByDesc('id');

        if (isset($filters['per_page']) || isset($filters['page'])) {
            $perPage = (int) ($filters['per_page'] ?? 20);
            return $query->paginate($perPage, ['*'], 'page', (int) ($filters['page'] ?? 1));
        }

        return $query->get();
    }

    /**
     * Get a single visible popup for the user or guest.
     */
    public function getPopup(int $id, ?User $user): Popup
    {
        return $this->buildVisibleQuery($user)->findOrFail($id);
    }

    /**
     * Build base query for visible popups matching exposure target for the user.
     * Checks:
     *  1. is_active = true
     *  2. exposure_start_date is null or <= now()
     *  3. exposure_end_date is null or >= now()
     *  4. exposure_target matches 'all' or user's customer_id/user_id
     */
    protected function buildVisibleQuery(?User $user): Builder
    {
        $now = now();

        return Popup::query()
            ->active()
            ->where(function (Builder $q) use ($now) {
                $q->whereNull('exposure_start_date')
                    ->orWhere('exposure_start_date', '<=', $now);
            })
            ->where(function (Builder $q) use ($now) {
                $q->whereNull('exposure_end_date')
                    ->orWhere('exposure_end_date', '>=', $now);
            })
            ->where(function (Builder $query) use ($user) {
                $query->whereNull('exposure_target')
                    ->orWhere('exposure_target', 'all')
                    ->orWhere('exposure_target', '[]')
                    ->orWhereJsonContains('exposure_target', 'all');

                if ($user) {
                    if ($user->customer_id) {
                        $query->orWhereJsonContains('exposure_target', (int) $user->customer_id)
                            ->orWhereJsonContains('exposure_target', (string) $user->customer_id);
                    }

                    if ($user->id) {
                        $query->orWhereJsonContains('exposure_target', (int) $user->id)
                            ->orWhereJsonContains('exposure_target', (string) $user->id);
                    }
                }
            });
    }
}
