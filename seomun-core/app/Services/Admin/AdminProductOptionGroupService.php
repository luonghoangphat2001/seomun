<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminProductOptionGroupResource;
use App\Models\ProductOption;
use App\Models\ProductOptionGroup;
use App\Services\PaginationService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminProductOptionGroupService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    public function getProductOptionGroups(array $filters, int $perPage = 20): array
    {
        $query = ProductOptionGroup::with(['product', 'options']);

        $productId = Arr::get($filters, 'product_id');
        $code = Arr::get($filters, 'code');
        $name = Arr::get($filters, 'name');
        $displayType = Arr::get($filters, 'display_type');
        $isRequired = Arr::get($filters, 'is_required');
        $erpOptionGroupId = Arr::get($filters, 'erp_option_group_id');

        if ($productId) {
            $query->where('product_id', $productId);
        }

        if ($code) {
            $query->where('code', 'like', '%' . $code . '%');
        }

        if ($name) {
            $query->where('name', 'like', '%' . $name . '%');
        }

        if ($displayType) {
            $query->where('display_type', $displayType);
        }

        if ($isRequired !== null) {
            $query->where('is_required', filter_var($isRequired, FILTER_VALIDATE_BOOLEAN));
        }

        if ($erpOptionGroupId) {
            $query->where('erp_option_group_id', $erpOptionGroupId);
        }

        $sortBy = Arr::get($filters, 'sort_by', 'sort_order');
        $sortOrder = Arr::get($filters, 'sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);
        
        $productOptionGroups = $query->paginate($perPage);
        return [
            'product_option_groups' => AdminProductOptionGroupResource::collection($productOptionGroups->items()),
            'pagination' => $this->paginationService->format($productOptionGroups),
        ];
    }

    public function getProductOptionGroup(int $id): ProductOptionGroup
    {
        return ProductOptionGroup::with(['product', 'options'])->findOrFail($id);
    }

    public function createProductOptionGroup(array $data): ProductOptionGroup
    {
        return DB::transaction(function () use ($data) {

            $group = ProductOptionGroup::create([
                'product_id' => $data['product_id'],
                'product_option_group_tab' => $data['product_option_group_tab'],
                'code' => $data['code'],
                'name' => $data['name'],
                'display_type' => $data['display_type'] ?? 'select',
                'is_required' => $data['is_required'] ?? false,
                'sort_order' => $data['sort_order'] ?? 0,
                'erp_option_group_id' => $data['erp_option_group_id'] ?? null,
            ]);

            return $group;
        });
    }

    public function updateProductOptionGroup(int $id, array $data): ProductOptionGroup
    {
        return DB::transaction(function () use ($id, $data) {
            $group = ProductOptionGroup::findOrFail($id);

            if (isset($data['code']) && $data['code'] !== $group->code) {
                throw new \Exception('코드 필드는 수정할 수 없습니다.', 422);
            }

            if (isset($data['product_id']) && $data['product_id'] !== $group->product_id) {
                throw new \Exception('상품 ID는 수정할 수 없습니다.', 422);
            }

            $updateData = [];

            if (isset($data['name'])) {
                $updateData['name'] = $data['name'];
            }
            if (isset($data['product_option_group_tab'])) {
                $updateData['product_option_group_tab'] = $data['product_option_group_tab'];
            }
            if (isset($data['display_type'])) {
                $updateData['display_type'] = $data['display_type'];
            }
            if (isset($data['is_required'])) {
                $updateData['is_required'] = filter_var($data['is_required'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($data['sort_order'])) {
                $updateData['sort_order'] = (int) $data['sort_order'];
            }
            if (isset($data['erp_option_group_id'])) {
                $updateData['erp_option_group_id'] = $data['erp_option_group_id'];
            }

            if (! empty($updateData)) {
                $group->update($updateData);
            }

            return $group->fresh(['product', 'options']);
        });
    }

    public function deleteProductOptionGroup(int $id): void
    {
        DB::transaction(function () use ($id) {
            $group = ProductOptionGroup::with(['options'])->findOrFail($id);
            if ($group->options()->count() > 0) {
                throw new \Exception('활성 옵션이 있는 옵션 그룹은 삭제할 수 없습니다. 먼저 옵션을 삭제해 주세요.', 422);
            }
            $group->delete();
        });
    }
}
