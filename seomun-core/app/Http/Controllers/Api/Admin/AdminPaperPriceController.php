<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\PaperPrice\AdminPaperPriceListRequest;
use App\Http\Requests\Admin\PaperPrice\AdminPaperPriceStoreRequest;
use App\Http\Requests\Admin\PaperPrice\AdminPaperPriceUpdateRequest;
use App\Http\Resources\Admin\AdminPaperPriceResource;
use App\Models\PaperPrice;
use App\Services\Admin\PaperPriceService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminPaperPriceController extends BaseController
{
    public function __construct(
        protected PaperPriceService $paperPriceService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for paper prices.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->paperPriceService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get list of paper prices for Admin.
     */
    public function index(AdminPaperPriceListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->paperPriceService->getPaperPrices($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '용지 가격 목록이 성공적으로 조회되었습니다.', [
                'paper_prices' => AdminPaperPriceResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single paper price detail.
     */
    public function show(PaperPrice $paperPrice): JsonResponse
    {
        try {
            $paperPrice = $this->paperPriceService->getPaperPrice($paperPrice->id);

            return $this->responseSuccess(200, '용지 가격이 성공적으로 조회되었습니다.', [
                'paper_price' => new AdminPaperPriceResource($paperPrice),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Register a new paper price.
     */
    public function store(AdminPaperPriceStoreRequest $request): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $paperPrice = $this->paperPriceService->createPaperPrice($adminUser, $data);

            return $this->responseSuccess(201, '용지 가격이 성공적으로 생성되었습니다.', [
                'paper_price' => new AdminPaperPriceResource($paperPrice),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update a paper price.
     */
    public function update(AdminPaperPriceUpdateRequest $request, PaperPrice $paperPrice): JsonResponse
    {
        try {
            $data = $request->validated();

            $paperPrice = $this->paperPriceService->updatePaperPrice($paperPrice->id, $data);

            return $this->responseSuccess(200, '용지 가격이 성공적으로 수정되었습니다.', [
                'paper_price' => new AdminPaperPriceResource($paperPrice),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete a paper price.
     */
    public function destroy(PaperPrice $paperPrice): JsonResponse
    {
        try {
            $this->paperPriceService->deletePaperPrice($paperPrice->id);

            return $this->responseSuccess(200, '용지 가격이 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
