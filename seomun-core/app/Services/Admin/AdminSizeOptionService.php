<?php

namespace App\Services\Admin;

use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionGroupType;
use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Models\SizeOption;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminSizeOptionService
{
    /**
     * Get paginated list of size options with filters.
     */
    public function getSizeOptions(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = SizeOption::with(['creator'])
            ->where(function ($q) use ($filters) {
                if (isset($filters['search']) && ! empty($filters['search'])) {
                    $q->where('name', 'like', '%' . $filters['search'] . '%');
                }
                if (isset($filters['is_active'])) {
                    $isActive = $filters['is_active'] === 'true' ? true : false;
                    $q->where('is_active', $isActive);
                }
            })
            ->orderBy('created_at', 'desc');

        $currentPage = Arr::get(
            $filters,
            'page',
            Arr::get($filters, 'current_page', 1)
        );

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Get a single size option by ID.
     */
    public function getSizeOption(int $id): SizeOption
    {
        return SizeOption::with(['creator'])
            ->where('id', $id)
            ->firstOrFail();
    }

    /**
     * Create a new size option.
     */
    public function createSizeOption(User $user, array $data): SizeOption
    {
        if (isset($data['is_active'])) {
            $data['is_active'] = $data['is_active'] === 'active';
            unset($data['status']);
        }

        return DB::transaction(function () use ($user, $data) {
            $cuttingWidth = Arr::get($data, 'cutting_width');
            $cuttingHeight = Arr::get($data, 'cutting_height');

            $exists = SizeOption::where('cutting_width', $cuttingWidth)
                ->where('cutting_height', $cuttingHeight)
                ->exists();

            if ($exists) {
                throw new \RuntimeException(
                    "Size option with cutting width {$cuttingWidth} and cutting height {$cuttingHeight} already exists."
                );
            }

            $sizeOption = SizeOption::create([
                'name' => Arr::get($data, 'name'),
                'cutting_width' => Arr::get($data, 'cutting_width'),
                'cutting_height' => Arr::get($data, 'cutting_height'),
                'working_width' => Arr::get($data, 'working_width', 0),
                'working_height' => Arr::get($data, 'working_height', 0),
                'is_active' => Arr::get($data, 'is_active', true),
                'created_by' => $user->id,
            ]);

            $this->syncErpOptions($sizeOption);

            return $sizeOption->refresh();
        });
    }

    /**
     * Update an existing size option.
     */
    public function updateSizeOption(int $id, array $data): SizeOption
    {
        return DB::transaction(function () use ($id, $data) {
            $sizeOption = $this->getSizeOption($id);

            $cuttingWidth = Arr::get($data, 'cutting_width', $sizeOption->cutting_width);
            $cuttingHeight = Arr::get($data, 'cutting_height', $sizeOption->cutting_height);

            $exists = SizeOption::where('cutting_width', $cuttingWidth)
                ->where('cutting_height', $cuttingHeight)
                ->where('id', '!=', $sizeOption->id)
                ->exists();

            if ($exists) {
                throw new \RuntimeException(
                    "Size option with cutting width {$cuttingWidth} and cutting height {$cuttingHeight} already exists."
                );
            }
            $sizeOption->fill($data);
            $sizeOption->save();

            $this->syncErpOptions($sizeOption);

            return $sizeOption->refresh();
        });
    }

    /**
     * Sync ERP options for the size option.
     */
    public function syncErpOptions(SizeOption $sizeOption): void
    {
        $erpOptionGroup = ErpOptionGroup::firstOrCreate([
            'code' => ErpOptionGroupCode::SIZE->value,
        ], [
            'label' => 'Size Option',
            'type' => ErpOptionGroupType::POST_PROCESSING,
            'display_type' => 'select',
            'is_required' => true,
            'sort_order' => 1,
        ]);

        $existingOption = ErpOption::where('size_option_id', $sizeOption->id)
            ->where('erp_option_group_id', $erpOptionGroup->id)
            ->first();

        if ($existingOption) {
            $existingOption->update([
                'label' => $sizeOption->name,
                'value' => (string) $sizeOption->id,
                'attributes' => [
                    'cutting_width' => $sizeOption->cutting_width,
                    'cutting_height' => $sizeOption->cutting_height,
                    'working_width' => $sizeOption->working_width,
                    'working_height' => $sizeOption->working_height,
                ],
                'is_active' => true,
            ]);
        } else {
            ErpOption::create([
                'erp_option_group_id' => $erpOptionGroup->id,
                'size_option_id' => $sizeOption->id,
                'label' => $sizeOption->name,
                'code' => 'size_option_' . $sizeOption->id,
                'value' => (string) $sizeOption->id,
                'attributes' => [
                    'cutting_width' => $sizeOption->cutting_width,
                    'cutting_height' => $sizeOption->cutting_height,
                    'working_width' => $sizeOption->working_width,
                    'working_height' => $sizeOption->working_height,
                ],
                'is_active' => true,
            ]);
        }
    }

    /**
     * Delete a size option.
     */
    public function deleteSizeOption(int $id): void
    {
        DB::transaction(function () use ($id) {
            $sizeOption = $this->getSizeOption($id);
            $sizeOption->delete();
        });
    }

    /**
     * Get all active size options.
     */
    public function getActiveSizeOptions(): Collection
    {
        return SizeOption::where('is_active', true)
            ->orderBy('name')
            ->get();
    }
}
