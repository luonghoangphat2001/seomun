<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\UnitPrice\AdminUnitPriceItemStoreRequest;
use App\Http\Requests\Admin\UnitPrice\AdminUnitPriceItemUpdateRequest;
use App\Http\Requests\Admin\UnitPrice\AdminUnitPriceListRequest;
use App\Http\Requests\Admin\UnitPrice\AdminUnitPriceStoreRequest;
use App\Http\Requests\Admin\UnitPrice\AdminUnitPriceUpdateRequest;
use App\Services\Admin\AdminUnitPriceService;
use App\Services\PaginationService;
use App\Http\Resources\Admin\AdminUnitPriceItemResource;
use App\Http\Resources\Admin\AdminUnitPriceResource;
use Illuminate\Http\JsonResponse;

class AdminUnitPriceController extends BaseController
{
    public function __construct(
        protected AdminUnitPriceService $unitPriceService,
        protected PaginationService $paginationService,
    ) {}

    public function index(AdminUnitPriceListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $unitPrices = $this->unitPriceService->getUnitPrices($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '단가 목록이 성공적으로 조회되었습니다.', [
                'unit_prices' => AdminUnitPriceResource::collection($unitPrices->items()),
            ], $this->paginationService->format($unitPrices));
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
            $unitPrice = $this->unitPriceService->getUnitPrice($id);

            return response()->json([
                'success' => true,
                'data' => ['unit_price' => new AdminUnitPriceResource($unitPrice)],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function store(AdminUnitPriceStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $unitPrice = $this->unitPriceService->createUnitPrice($request->user(), $data);

            return response()->json([
                'success' => true,
                'message' => '단가가 성공적으로 생성되었습니다.',
                'data' => ['unit_price' => $unitPrice],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function update(AdminUnitPriceUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $unitPrice = $this->unitPriceService->updateUnitPrice($id, $data, $request->user());

            return response()->json([
                'success' => true,
                'message' => '단가가 성공적으로 수정되었습니다.',
                'data' => ['unit_price' => new AdminUnitPriceResource($unitPrice)],
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
            $this->unitPriceService->deleteUnitPrice($id);

            return response()->json([
                'success' => true,
                'message' => '단가가 성공적으로 삭제되었습니다.',
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
            $unitPrice = $this->unitPriceService->toggleStatus($id);

            return response()->json([
                'success' => true,
                'message' => '단가 상태가 성공적으로 변경되었습니다.',
                'data' => ['unit_price' => $unitPrice],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function items(int $unitPriceId): JsonResponse
    {
        try {
            $items = $this->unitPriceService->getItemsByUnitPrice($unitPriceId, []);

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

    public function storeItem(AdminUnitPriceItemStoreRequest $request, int $unitPriceId): JsonResponse
    {
        try {
            $data = $request->validated();
            $item = $this->unitPriceService->createItem($request->user(), $unitPriceId, $data);

            return response()->json([
                'success' => true,
                'message' => '단가 항목이 성공적으로 생성되었습니다.',
                'data' => ['item' => $item],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function updateItem(AdminUnitPriceItemUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $item = $this->unitPriceService->updateItem($id, $data, $request->user());

            return response()->json([
                'success' => true,
                'message' => '단가 항목이 성공적으로 수정되었습니다.',
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
            $this->unitPriceService->deleteItem($id);

            return response()->json([
                'success' => true,
                'message' => '단가 항목이 성공적으로 삭제되었습니다.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
