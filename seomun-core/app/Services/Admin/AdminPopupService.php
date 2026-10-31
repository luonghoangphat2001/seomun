<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminPopupResource;
use App\Models\Popup;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminPopupService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for popups.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        $popupNames = Popup::query()
            ->select('name')
            ->distinct()
            ->orderBy('name')
            ->pluck('name')
            ->filter()
            ->values()
            ->map(fn (string $name) => [
                'value' => $name,
                'label' => $name,
            ])
            ->all();

        $exposureLocations = Popup::query()
            ->select('exposure_location')
            ->distinct()
            ->orderBy('exposure_location')
            ->pluck('exposure_location')
            ->filter()
            ->values()
            ->map(fn (string $location) => [
                'value' => $location,
                'label' => ucfirst($location),
            ])
            ->all();

        $registrantIds = Popup::query()
            ->whereNotNull('created_by')
            ->distinct()
            ->pluck('created_by');
        $registrants = User::query()
            ->whereIn('id', $registrantIds)
            ->select('id', 'username', 'name')
            ->orderBy('username')
            ->limit(100)
            ->get()
            ->map(fn (User $user) => [
                'value' => $user->id,
                'label' => $user->username ?? $user->name ?? ('User #'.$user->id),
            ])
            ->values()
            ->all();

        return [
            'popup_name_options' => $popupNames,
            'exposure_location_options' => $exposureLocations,
            'status_options' => [
                ['value' => 'exposed', 'label' => 'Exposed'],
                ['value' => 'non-exposed', 'label' => 'Non-Exposed'],
            ],
            'period_options' => [
                ['value' => 'today', 'label' => 'Today'],
                ['value' => '7_days', 'label' => 'Last 7 days'],
                ['value' => '30_days', 'label' => 'Last 30 days'],
            ],
            'registrant_options' => $registrants,
        ];
    }

    /**
     * Get popups with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPopups(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Popup::query()->with('createdBy');

        // Search term (name, exposure_location)
        $search = Arr::get($filters, 'search_term');
        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('exposure_location', 'like', '%'.$search.'%');
            });
        }

        // Filter by popup name
        $name = Arr::get($filters, 'popup_name');
        if ($name) {
            $query->where('name', 'like', '%'.$name.'%');
        }

        // Filter by exposure location
        $location = Arr::get($filters, 'exposure_location');
        if ($location) {
            $query->where('exposure_location', $location);
        }

        // Filter by status (exposed / non-exposed)
        $status = Arr::get($filters, 'status');
        if ($status) {
            if ($status === 'exposed') {
                $query->where('is_active', true)
                    ->where(function (Builder $q) {
                        $q->whereNull('exposure_start_date')
                            ->orWhere('exposure_start_date', '<=', now());
                    })
                    ->where(function (Builder $q) {
                        $q->whereNull('exposure_end_date')
                            ->orWhere('exposure_end_date', '>=', now());
                    });
            } elseif ($status === 'non-exposed') {
                $query->where(function (Builder $q) {
                    $q->where('is_active', false)
                        ->orWhere(function (Builder $q2) {
                            $q2->whereNotNull('exposure_start_date')
                                ->where('exposure_start_date', '>', now());
                        })
                        ->orWhere(function (Builder $q2) {
                            $q2->whereNotNull('exposure_end_date')
                                ->where('exposure_end_date', '<', now());
                        });
                });
            }
        }

        // Filter by registrant
        $registrantId = Arr::get($filters, 'registrant_id');
        if ($registrantId) {
            $query->where('created_by', $registrantId);
        }

        // Filter by exposure period
        $periodFrom = Arr::get($filters, 'exposure_period_from');
        $periodTo = Arr::get($filters, 'exposure_period_to');
        if ($periodFrom) {
            $query->whereDate('exposure_start_date', '>=', $periodFrom);
        }
        if ($periodTo) {
            $query->whereDate('exposure_end_date', '<=', $periodTo);
        }

        // Sorting
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $sortColumn = match ($sortBy) {
            'name' => 'name',
            'status' => 'is_active',
            'created_at' => 'created_at',
            default => 'created_at',
        };

        $query->orderBy($sortColumn, $sortOrder);

        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    public function getPopup(int $id): Popup
    {
        return Popup::with('createdBy')->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createPopup(User $adminUser, array $data): Popup
    {
        return DB::transaction(function () use ($adminUser, $data) {
            $exposureTarget = $data['exposure_target'] ?? 'all';
            if ($exposureTarget === null || $exposureTarget === '' || (is_array($exposureTarget) && count($exposureTarget) === 0)) {
                $exposureTarget = 'all';
            }

            // Either content or image_path must be provided
            if (empty($data['content']) && empty($data['image_path'])) {
                throw new \InvalidArgumentException('Either content or image_path must be provided');
            }

            return Popup::create([
                'name' => $data['name'],
                'content' => $data['content'] ?? null,
                'image_path' => $data['image_path'] ?? null,
                'exposure_target' => $exposureTarget === 'all' ? ['all'] : (array) $exposureTarget,
                'exposure_location' => $data['exposure_location'] ?? null,
                'width' => $data['width'] ?? null,
                'height' => $data['height'] ?? null,
                'is_active' => $data['status'] === 'exposed',
                'exposure_start_date' => $data['exposure_start_date'] ?? null,
                'exposure_end_date' => $data['exposure_end_date'] ?? null,
                'created_by' => $adminUser->id,
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updatePopup(int $id, array $data): Popup
    {
        return DB::transaction(function () use ($id, $data) {
            $popup = Popup::findOrFail($id);

            $updateData = Arr::only($data, [
                'name',
                'content',
                'image_path',
                'exposure_location',
                'width',
                'height',
                'exposure_start_date',
                'exposure_end_date',
            ]);

            if (isset($data['status'])) {
                $updateData['is_active'] = $data['status'] === 'exposed';
            }

            if (isset($data['exposure_target'])) {
                $exposureTarget = $data['exposure_target'];
                if ($exposureTarget === null || $exposureTarget === '' || (is_array($exposureTarget) && count($exposureTarget) === 0)) {
                    $exposureTarget = 'all';
                }
                $updateData['exposure_target'] = $exposureTarget === 'all' ? ['all'] : (array) $exposureTarget;
            }

            $popup->update($updateData);

            return $popup;
        });
    }

    public function deletePopup(int $id): void
    {
        DB::transaction(function () use ($id) {
            $popup = Popup::findOrFail($id);
            $popup->delete();
        });
    }
}
