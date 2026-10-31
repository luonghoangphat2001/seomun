<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\ProductOption\AdminProductOptionListRequest;
use App\Http\Requests\Admin\ProductOption\AdminProductOptionStoreRequest;
use App\Http\Requests\Admin\ProductOption\AdminProductOptionUpdateRequest;
use App\Http\Resources\Admin\AdminProductOptionDetailResource;
use App\Services\Admin\AdminProductOptionService;
use Illuminate\Http\JsonResponse;

class AdminProductOptionController extends BaseController
{
    public function __construct(
        protected AdminProductOptionService $adminProductOptionService
    ) {}

    public function index(AdminProductOptionListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $result = $this->adminProductOptionService->getProductOptions($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '상품 옵션 목록이 성공적으로 조회되었습니다.', $result);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $option = $this->adminProductOptionService->getProductOption($id);

            return $this->responseSuccess(200, '상품 옵션이 성공적으로 조회되었습니다.', [
                'product_option' => new AdminProductOptionDetailResource($option),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function store(AdminProductOptionStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            $option = $this->adminProductOptionService->createProductOption($data);

            return $this->responseSuccess(201, '상품 옵션이 성공적으로 생성되었습니다.', [
                'product_option' => new AdminProductOptionDetailResource($option->load(['group.product'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function update(AdminProductOptionUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $option = $this->adminProductOptionService->updateProductOption($id, $data);

            return $this->responseSuccess(200, '상품 옵션이 성공적으로 수정되었습니다.', [
                'product_option' => new AdminProductOptionDetailResource($option->load(['group.product'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminProductOptionService->softDeleteProductOption($id);

            return $this->responseSuccess(200, '상품 옵션이 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
