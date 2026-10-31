<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\ProductOptionGroup\AdminProductOptionGroupListRequest;
use App\Http\Requests\Admin\ProductOptionGroup\AdminProductOptionGroupStoreRequest;
use App\Http\Requests\Admin\ProductOptionGroup\AdminProductOptionGroupUpdateRequest;
use App\Http\Resources\Admin\AdminProductOptionGroupDetailResource;
use App\Services\Admin\AdminProductOptionGroupService;
use Illuminate\Http\JsonResponse;

class AdminProductOptionGroupController extends BaseController
{
    public function __construct(
        protected AdminProductOptionGroupService $adminProductOptionGroupService
    ) {}

    public function index(AdminProductOptionGroupListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $result = $this->adminProductOptionGroupService->getProductOptionGroups($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '상품 옵션 그룹 목록이 성공적으로 조회되었습니다.', $result);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $group = $this->adminProductOptionGroupService->getProductOptionGroup($id);

            return $this->responseSuccess(200, '상품 옵션 그룹이 성공적으로 조회되었습니다.', [
                'product_option_group' => new AdminProductOptionGroupDetailResource($group),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function store(AdminProductOptionGroupStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            $group = $this->adminProductOptionGroupService->createProductOptionGroup($data);

            return $this->responseSuccess(201, '상품 옵션 그룹이 성공적으로 생성되었습니다.', [
                'product_option_group' => new AdminProductOptionGroupDetailResource($group->load(['product', 'options'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function update(AdminProductOptionGroupUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $group = $this->adminProductOptionGroupService->updateProductOptionGroup($id, $data);

            return $this->responseSuccess(200, '상품 옵션 그룹이 성공적으로 수정되었습니다.', [
                'product_option_group' => new AdminProductOptionGroupDetailResource($group->load(['product', 'options'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminProductOptionGroupService->deleteProductOptionGroup($id);

            return $this->responseSuccess(200, '상품 옵션 그룹이 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
