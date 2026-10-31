<?php

namespace App\Services\Admin;

use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminErpOptionService
{

    /**
     * Build query with filters (reusable for list and export).
     *
     * @param  array<string, mixed>  $filters
     */
    public function buildQuery(array $filters): Builder
    {
        $query = ErpOption::query()
            ->with([
                'erpOptionGroup:id,code,label,display_type,is_required,sort_order',
            ])
            ->withCount([
                'conditions',
                'triggerDependencies',
            ]);

        // Backward compatibility: old param erp_code -> option_code
        $optionCode = Arr::get($filters, 'option_code', Arr::get($filters, 'erp_code'));
        if ($optionCode) {
            $query->where('code', 'like', '%' . $optionCode . '%');
        }

        // Backward compatibility: old param name -> option_label
        $optionLabel = Arr::get($filters, 'option_label', Arr::get($filters, 'name'));
        if ($optionLabel) {
            $query->where('label', 'like', '%' . $optionLabel . '%');
        }

        if ($groupId = Arr::get($filters, 'erp_option_group_id')) {
            $query->whereHas('erpOptionGroup', function (Builder $builder) use ($groupId) {
                $builder->where('erp_option_groups.id', $groupId);
            });
        }

        if ($groupCode = Arr::get($filters, 'group_code')) {
            $query->whereHas('erpOptionGroup', function (Builder $builder) use ($groupCode) {
                $builder->where('code', 'like', '%' . $groupCode . '%');
            });
        }

        if ($groupLabel = Arr::get($filters, 'group_label')) {
            $query->whereHas('erpOptionGroup', function (Builder $builder) use ($groupLabel) {
                $builder->where('label', 'like', '%' . $groupLabel . '%');
            });
        }

        if ($displayType = Arr::get($filters, 'display_type')) {
            $query->whereHas('erpOptionGroup', function (Builder $builder) use ($displayType) {
                $builder->where('display_type', $displayType);
            });
        }

        if (Arr::has($filters, 'is_required') && Arr::get($filters, 'is_required') !== null) {
            $query->whereHas('erpOptionGroup', function (Builder $builder) use ($filters) {
                $builder->where('is_required', (bool) Arr::get($filters, 'is_required'));
            });
        }

        if ($value = Arr::get($filters, 'value')) {
            $query->where('value', 'like', '%' . $value . '%');
        }

        if ($code = Arr::get($filters, 'code')) {
            $query->where('code', 'like', '%' . $code . '%');
        }

        if ($label = Arr::get($filters, 'label')) {
            $query->where('label', 'like', '%' . $label . '%');
        }

        // Backward compatibility: old status(active/inactive) -> is_active
        if ($status = Arr::get($filters, 'status')) {
            $query->where('is_active', $status === 'active');
        }

        if (Arr::has($filters, 'is_active') && Arr::get($filters, 'is_active') !== null) {
            $query->where('is_active', (bool) Arr::get($filters, 'is_active'));
        }

        // Backward compatibility: old amount -> additional_price
        if ($amount = Arr::get($filters, 'amount')) {
            $query->where('additional_price', $amount);
        }

        if ($priceMin = Arr::get($filters, 'additional_price_min')) {
            $query->where('additional_price', '>=', $priceMin);
        }

        if ($priceMax = Arr::get($filters, 'additional_price_max')) {
            $query->where('additional_price', '<=', $priceMax);
        }

        if ($createdFrom = Arr::get($filters, 'created_from', Arr::get($filters, 'registered_from'))) {
            $query->where('created_at', '>=', $createdFrom);
        }

        if ($createdTo = Arr::get($filters, 'created_to', Arr::get($filters, 'registered_to'))) {
            $query->where('created_at', '<=', $createdTo);
        }

        // Sort (includes backward-compatible sort keys)
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');
        $sortColumn = match ($sortBy) {
            'erp_code', 'option_code', 'code' => 'code',
            'name', 'option_label', 'label' => 'label',
            'amount', 'additional_price' => 'additional_price',
            'status', 'is_active' => 'is_active',
            'sort_order' => 'sort_order',
            'created_at', 'registered_at' => 'created_at',
            default => 'created_at',
        };

        $query->orderBy($sortColumn, $sortOrder);

        return $query;
    }

    /**
     * Get ERP options with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getErpOptions(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);
        $currentPage = Arr::get($filters, 'page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Get single ERP option detail.
     */
    public function getErpOption(int $id): ErpOption
    {
        return ErpOption::with([
            'erpOptionGroup:id,code,label,display_type,is_required,sort_order',
        ])->withCount([
            'conditions',
            'triggerDependencies',
        ])->findOrFail($id);
    }

    /**
     * Get search filter options for ERP options.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        return [
            'status_options' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
            'display_type_options' => [
                ['value' => 'select', 'label' => 'Select'],
                ['value' => 'radio', 'label' => 'Radio'],
                ['value' => 'checkbox', 'label' => 'Checkbox'],
            ],
            'sort_options' => [
                ['value' => 'option_code', 'label' => 'Option Code'],
                ['value' => 'option_label', 'label' => 'Option Label'],
                ['value' => 'is_active', 'label' => 'Status'],
                ['value' => 'additional_price', 'label' => 'Additional Price'],
                ['value' => 'sort_order', 'label' => 'Sort Order'],
                ['value' => 'created_at', 'label' => 'Created At'],
            ],
        ];
    }

    /**
     * Create a new ERP option.
     */
    public function createErpOption(array $data): ErpOption
    {
        $data['value'] = $data['value'] ?? $data['label'];
        return ErpOption::create($data);
    }

    /**
     * Update an existing ERP option.
     */
    public function updateErpOption(int $id, array $data): ErpOption
    {
        $erpOption = ErpOption::findOrFail($id);
        $data['value'] = $data['value'] ?? $data['label'];
        $erpOption->update($data);

        $this->updateProductOptions($erpOption, $data);

        return $erpOption;
    }

    private function updateProductOptions(ErpOption $erpOption, array $data): void
    {
        $productOptionData = array_filter([
            'label' => $data['label'] ?? null,
            'value' => $data['value'] ?? null,
        ], fn($value) => $value !== null);

        if (empty($productOptionData)) {
            return;
        }

        $erpOption->productOptions()->update($productOptionData);
    }

    /**
     * Delete an ERP option.
     */
    public function deleteErpOption(int $id): bool
    {
        $erpOption = ErpOption::findOrFail($id);

        $hasInvalidGroup = $erpOption->erpOptionGroup()
            ->whereIn('code', ['SIZE', 'PAPER'])
            ->exists();

        if ($hasInvalidGroup) {
            throw new \Exception(
                'ERP Option을 삭제할 수 없습니다. 먼저 SIZE 또는 Option Management에서 삭제해 주세요.'
            );
        }

        return $erpOption->delete();
    }
}
