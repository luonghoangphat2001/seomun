<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\OrderExtraEntry\OrderExtraEntryListRequest;
use App\Http\Requests\Admin\OrderExtraEntry\StoreOrderExtraEntryRequest;
use App\Http\Requests\Admin\OrderExtraEntry\UpdateOrderExtraEntryRequest;
use App\Http\Resources\Admin\AdminOrderExtraEntryResource;
use App\Models\OrderExtraEntry;
use App\Services\Admin\AdminOrderExtraEntryService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminOrderExtraEntryController extends BaseController
{
    public function __construct(
        protected AdminOrderExtraEntryService $adminOrderExtraEntryService,
        protected PaginationService $paginationService
    ) {}

    public function index(OrderExtraEntryListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $data = $this->adminOrderExtraEntryService->getOrderExtraEntries($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '주문 추가 항목 목록이 성공적으로 조회되었습니다.', [
                'data' => AdminOrderExtraEntryResource::collection($data->items()),
            ], $this->paginationService->format($data));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $data = $this->adminOrderExtraEntryService->getOrderExtraEntry($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => new AdminOrderExtraEntryResource($data),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function store(StoreOrderExtraEntryRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $entry = OrderExtraEntry::create($validated);

            $entry->products()->sync($request->product_ids);

            return response()->json([
                'success' => true,
                'message' => '주문 추가 항목이 성공적으로 생성되었습니다.',
                'data' => [
                    'data' => $entry->load('products'),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '주문 추가 항목 생성 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(
        UpdateOrderExtraEntryRequest $request,
        int|string $id
    ): JsonResponse {
        try {
            $data = OrderExtraEntry::findOrFail($id);

            $validated = $request->validated();
            if (empty($validated)) {
                return response()->json([
                    'success' => false,
                    'message' => '수정할 유효한 데이터가 없습니다.',
                ], 422);
            }

            $data->update($validated);

            return response()->json([
                'success' => true,
                'message' => '주문 추가 항목이 성공적으로 수정되었습니다.',
                'data' => [
                    'data' => new AdminOrderExtraEntryResource($data->fresh()),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '주문 추가 항목 수정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int|string $id): JsonResponse
    {
        try {
            $data = OrderExtraEntry::findOrFail($id);
            $data->delete();

            return response()->json([
                'success' => true,
                'message' => '주문 추가 항목이 성공적으로 삭제되었습니다.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '주문 추가 항목 삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
