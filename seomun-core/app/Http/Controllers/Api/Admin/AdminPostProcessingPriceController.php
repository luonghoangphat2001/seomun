<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\PostProcessingPrice\AdminPostProcessingPriceItemStoreRequest;
use App\Http\Requests\Admin\PostProcessingPrice\AdminPostProcessingPriceItemUpdateRequest;
use App\Http\Requests\Admin\PostProcessingPrice\AdminPostProcessingPriceListRequest;
use App\Http\Requests\Admin\PostProcessingPrice\AdminPostProcessingPriceStoreRequest;
use App\Http\Requests\Admin\PostProcessingPrice\AdminPostProcessingPriceUpdateRequest;
use App\Services\Admin\AdminPostProcessingPriceService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminPostProcessingPriceController extends BaseController
{
    public function __construct(
        protected AdminPostProcessingPriceService $postProcessingPriceService,
        protected PaginationService $paginationService,
    ) {}

    public function index(AdminPostProcessingPriceListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $prices = $this->postProcessingPriceService->getPostProcessingPrices($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '후가공 단가 목록이 성공적으로 조회되었습니다.', [
                'post_processing_prices' => $prices->items(),
            ], $this->paginationService->format($prices));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $price = $this->postProcessingPriceService->getPostProcessingPrice($id);

            return response()->json([
                'success' => true,
                'data' => ['post_processing_price' => $price],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function store(AdminPostProcessingPriceStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $price = $this->postProcessingPriceService->createPostProcessingPrice($data);

            return response()->json([
                'success' => true,
                'message' => '후가공 단가가 성공적으로 생성되었습니다.',
                'data' => ['post_processing_price' => $price],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function update(AdminPostProcessingPriceUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $price = $this->postProcessingPriceService->updatePostProcessingPrice($id, $data);

            return response()->json([
                'success' => true,
                'message' => '후가공 단가가 성공적으로 수정되었습니다.',
                'data' => ['post_processing_price' => $price],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->postProcessingPriceService->deletePostProcessingPrice($id);

            return response()->json([
                'success' => true,
                'message' => '후가공 단가가 성공적으로 삭제되었습니다.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function toggleStatus(int $id): JsonResponse
    {
        try {
            $price = $this->postProcessingPriceService->toggleStatus($id);

            return response()->json([
                'success' => true,
                'message' => '후가공 단가 상태가 성공적으로 변경되었습니다.',
                'data' => ['post_processing_price' => $price],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function items(int $postProcessingPriceId): JsonResponse
    {
        try {
            $items = $this->postProcessingPriceService->getItemsByPostProcessingPrice($postProcessingPriceId);

            return response()->json([
                'success' => true,
                'data' => ['items' => $items],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function storeItem(AdminPostProcessingPriceItemStoreRequest $request, int $postProcessingPriceId): JsonResponse
    {
        try {
            $data = $request->validated();
            $item = $this->postProcessingPriceService->createItem($postProcessingPriceId, $data);

            return response()->json([
                'success' => true,
                'message' => '후가공 단가 항목이 성공적으로 생성되었습니다.',
                'data' => ['item' => $item],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function updateItem(AdminPostProcessingPriceItemUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $item = $this->postProcessingPriceService->updateItem($id, $data);

            return response()->json([
                'success' => true,
                'message' => '후가공 단가 항목이 성공적으로 수정되었습니다.',
                'data' => ['item' => $item],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function destroyItem(int $id): JsonResponse
    {
        try {
            $this->postProcessingPriceService->deleteItem($id);

            return response()->json([
                'success' => true,
                'message' => '후가공 단가 항목이 성공적으로 삭제되었습니다.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
