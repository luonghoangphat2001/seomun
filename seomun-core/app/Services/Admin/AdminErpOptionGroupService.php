<?php

namespace App\Services\Admin;

use App\Enums\ErpOptionGroupType;
use App\Models\ErpOptionGroup;
use App\Models\ErpOption;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminErpOptionGroupService
{

    /**
     * Build query with filters (reusable for list and export).
     *
     * @param  array<string, mixed>  $filters
     */
    public function buildQuery(array $filters): Builder
    {
        $query = ErpOptionGroup::query();

        if ($code = Arr::get($filters, 'code')) {
            $query->where('code', 'like', '%' . $code . '%');
        }

        if ($label = Arr::get($filters, 'label')) {
            $query->where('label', 'like', '%' . $label . '%');
        }

        if ($type = Arr::get($filters, 'type')) {
            $query->where('type', $type);
        }

        if (Arr::has($filters, 'is_required') && Arr::get($filters, 'is_required') !== null) {
            $query->where('is_required', (bool) Arr::get($filters, 'is_required'));
        }

        if ($displayType = Arr::get($filters, 'display_type')) {
            $query->where('display_type', $displayType);
        }

        if ($createdFrom = Arr::get($filters, 'created_from')) {
            $query->where('created_at', '>=', $createdFrom);
        }

        if ($createdTo = Arr::get($filters, 'created_to')) {
            $query->where('created_at', '<=', $createdTo);
        }

        // Sort
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');
        $sortColumn = match ($sortBy) {
            'code' => 'code',
            'label' => 'label',
            'type' => 'type',
            'is_required' => 'is_required',
            'display_type' => 'display_type',
            'created_at' => 'created_at',
            'sort_order' => 'sort_order',
            default => 'created_at',
        };

        $query->orderBy($sortColumn, $sortOrder);

        return $query;
    }

    /**
     * Get ERP option groups with filters.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getErpOptionGroups(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);
        $currentPage = Arr::get($filters, 'page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Get single ERP option group detail.
     */
    public function getErpOptionGroup(int $id): ErpOptionGroup
    {
        return ErpOptionGroup::withCount([
            'erpOptions',
        ])->findOrFail($id);
    }

    /**
     * Get search filter options for ERP option groups.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        return [
            'type_options' => collect(ErpOptionGroupType::cases())
                ->map(fn($item) => [
                    'value' => $item->value,
                    'label' => $item->label(),
                ])
                ->values()
                ->toArray(),
        ];
    }

    /**
     * Create a new ERP option group.
     */
    public function createErpOptionGroup(array $data): ErpOptionGroup
    {
        // Ensure that code and label are unique
        $code = Arr::get($data, 'code');
        $label = Arr::get($data, 'label');
        $existing = ErpOptionGroup::where('code', $code)->orWhere('label', $label)->first();
        if ($existing) {
            throw new \Exception('이미 존재하는 코드 또는 라벨입니다.');
        }

        return ErpOptionGroup::create($data);
    }

    /**
     * Update an existing ERP option group.
     */
    public function updateErpOptionGroup(int $id, array $data): ErpOptionGroup
    {
        $erpOptionGroup = ErpOptionGroup::findOrFail($id);

        // Ensure that code and label are unique
        $code = Arr::get($data, 'code');
        $label = Arr::get($data, 'label');
        $existing = ErpOptionGroup::where('code', $code)->orWhere('label', $label)->first();

        if ($existing && $existing->id !== $id) {
            throw new \Exception('이미 존재하는 코드 또는 라벨입니다.');
        }

        $erpOptionGroup->update($data);
        return $erpOptionGroup;
    }

    /**
     * Delete an ERP option group.
     */
    public function deleteErpOptionGroup(int $id): bool
    {
        $erpOptionGroup = ErpOptionGroup::findOrFail($id);
        // Check if the option group has any associated options
        if ($erpOptionGroup->erpOptions()->count() > 0) {
            throw new \Exception('연결된 옵션이 존재하는 옵션 그룹은 삭제할 수 없습니다.');
        }

        return $erpOptionGroup->delete();
    }
}
