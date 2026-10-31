<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminProductOptionDetailResource;
use App\Models\ProductOption;
use App\Models\ProductOptionGroup;
use App\Services\PaginationService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminProductOptionService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    public function getProductOptions(array $filters, int $perPage = 20): array
    {
        $query = ProductOption::query()->with(['group.product', 'deletedByUser']);

        $optionGroupId = Arr::get($filters, 'option_group_id');
        $optionCode = Arr::get($filters, 'option_code');
        $fieldName = Arr::get($filters, 'field_name');
        $category = Arr::get($filters, 'category');
        $label = Arr::get($filters, 'label');
        $value = Arr::get($filters, 'value');
        $isActive = Arr::get($filters, 'is_active');

        if ($optionGroupId) {
            $query->where('option_group_id', $optionGroupId);
        }

        if ($optionCode) {
            $query->where('option_code', 'like', '%'.$optionCode.'%');
        }

        if ($fieldName) {
            $query->where('field_name', 'like', '%'.$fieldName.'%');
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($label) {
            $query->where('label', 'like', '%'.$label.'%');
        }

        if ($value) {
            $query->where('value', 'like', '%'.$value.'%');
        }

        if ($isActive !== null) {
            $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = Arr::get($filters, 'sort_by', 'sort_order');
        $sortOrder = Arr::get($filters, 'sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $productOption = $query->paginate($perPage);
        return [
            'product_options' => AdminProductOptionDetailResource::collection($productOption->items()),
            'pagination' => $this->paginationService->format($productOption),
        ];
    }

    public function getProductOption(int $id): ProductOption
    {
        return ProductOption::with(['group.product', 'deletedByUser'])->findOrFail($id);
    }

    public function createProductOption(array $data): ProductOption
    {
        return DB::transaction(function () use ($data) {
            $group = ProductOptionGroup::find($data['option_group_id']);
            if (! $group) {
                throw new \Exception('옵션 그룹을 찾을 수 없습니다.', 422);
            }

            $existingOption = ProductOption::withTrashed()
                ->where('option_group_id', $data['option_group_id'])
                ->where('value', $data['value'])
                ->first();

            if ($existingOption) {
                if ($existingOption->deleted_at === null) {
                    throw new \Exception('이 그룹에 이미 존재하는 옵션 값입니다.', 422);
                }
                if (! $this->canRestore($existingOption)) {
                    throw new \Exception('삭제된 옵션 값과 중복되는 옵션을 생성할 수 없습니다.', 422);
                }

                $existingOption->restore();
                $existingOption->update([
                    'option_code' => $data['option_code'] ?? null,
                    'field_name' => $data['field_name'] ?? null,
                    'category' => $data['category'] ?? null,
                    'label' => $data['label'],
                    'additional_price' => $data['additional_price'] ?? 0,
                    'metadata' => $data['metadata'] ?? null,
                    'sort_order' => $data['sort_order'] ?? 0,
                    'is_active' => $data['is_active'] ?? true,
                ]);
                return $existingOption;
            }

            $option = ProductOption::create([
                'option_group_id' => $data['option_group_id'],
                'option_code' => $data['option_code'] ?? null,
                'field_name' => $data['field_name'] ?? null,
                'category' => $data['category'] ?? null,
                'label' => $data['label'],
                'value' => $data['value'],
                'additional_price' => $data['additional_price'] ?? 0,
                'metadata' => $data['metadata'] ?? null,
                'sort_order' => $data['sort_order'] ?? 0,
                'is_active' => $data['is_active'] ?? true,
            ]);
            return $option;
        });
    }

    public function updateProductOption(int $id, array $data): ProductOption
    {
        return DB::transaction(function () use ($id, $data) {
            $option = ProductOption::findOrFail($id);

            $updateData = [];

            if (array_key_exists('option_code', $data)) {
                $updateData['option_code'] = $data['option_code'];
            }
            if (array_key_exists('field_name', $data)) {
                $updateData['field_name'] = $data['field_name'];
            }
            if (array_key_exists('category', $data)) {
                $updateData['category'] = $data['category'];
            }
            if (isset($data['label'])) {
                $updateData['label'] = $data['label'];
            }
            if (isset($data['additional_price'])) {
                $updateData['additional_price'] = $data['additional_price'];
            }
            if (array_key_exists('metadata', $data)) {
                $updateData['metadata'] = $data['metadata'];
            }
            if (isset($data['sort_order'])) {
                $updateData['sort_order'] = (int) $data['sort_order'];
            }
            if (array_key_exists('is_active', $data)) {
                $updateData['is_active'] = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
            }

            if (empty($updateData)) {
                return $option;
            }

            $option->update($updateData);

            return $option->fresh(['group.product', 'deletedByUser']);
        });
    }

    public function softDeleteProductOption(int $id): void
    {
        DB::transaction(function () use ($id) {
            $option = ProductOption::findOrFail($id);

            $option->delete();
        });
    }

    protected function canRestore(ProductOption $option): bool
    {
        $existingActive = ProductOption::where('option_group_id', $option->option_group_id)
            ->where('value', $option->value)
            ->whereNull('deleted_at')
            ->first();

        return ! $existingActive;
    }

    public function getOptionsWithTrashed(int $id): ProductOption
    {
        return ProductOption::withTrashed()->findOrFail($id);
    }
}
