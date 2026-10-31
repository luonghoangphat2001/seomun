<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Coupon\AdminCouponIssueRequest;
use App\Http\Requests\Admin\Coupon\AdminCouponIssuanceListRequest;
use App\Http\Requests\Admin\Coupon\AdminCouponListRequest;
use App\Http\Requests\Admin\Coupon\AdminCouponStoreRequest;
use App\Http\Requests\Admin\Coupon\AdminCouponUpdateRequest;
use App\Http\Requests\Admin\Coupon\AdminCouponUpdateStatusRequest;
use App\Http\Resources\Admin\AdminCouponResource;
use App\Http\Resources\Admin\AdminCouponIssuanceResource;
use App\Services\Admin\AdminCouponService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AdminCouponController extends BaseController
{
    public function __construct(
        protected AdminCouponService $adminCouponService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for coupons.
     * GET /api/admin/coupons/search-filters
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminCouponService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get list of coupons with pagination and filters.
     * GET /api/admin/coupons
     */
    public function index(AdminCouponListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminCouponService->getCoupons($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '쿠폰 목록이 성공적으로 조회되었습니다.', [
                'coupons' => AdminCouponResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single coupon detail.
     * GET /api/admin/coupons/{id}
     */
    public function show(int $id): JsonResponse
    {
        try {
            $coupon = $this->adminCouponService->getCoupon($id);

            return $this->responseSuccess(200, '쿠폰이 성공적으로 조회되었습니다.', [
                'coupon' => new AdminCouponResource($coupon),
            ]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '해당 쿠폰을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get coupon issuance and usage history.
     * GET /api/admin/coupons/{id}/issuances
     */
    public function issuances(AdminCouponIssuanceListRequest $request, int $id): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);
            $paginator = $this->adminCouponService->getCouponIssuances($id, $filters, $perPage);

            return $this->responsePaginatedSuccess(200, '쿠폰 발급 내역이 성공적으로 조회되었습니다.', [
                'issuances' => AdminCouponIssuanceResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '해당 쿠폰을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Create a new coupon.
     * POST /api/admin/coupons
     */
    public function store(AdminCouponStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $coupon = $this->adminCouponService->createCoupon($data);

            return $this->responseSuccess(201, '쿠폰이 성공적으로 생성되었습니다.', [
                'coupon' => new AdminCouponResource($coupon),
            ]);
        } catch (\Throwable $e) {
            Log::error('Create coupon failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update an existing coupon.
     * PUT /api/admin/coupons/{id}
     */
    public function update(AdminCouponUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $coupon = $this->adminCouponService->updateCoupon($id, $data);

            return $this->responseSuccess(200, '쿠폰이 성공적으로 수정되었습니다.', [
                'coupon' => new AdminCouponResource($coupon),
            ]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '해당 쿠폰을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Update coupon failed', [
                'coupon_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete a coupon.
     * DELETE /api/admin/coupons/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminCouponService->deleteCoupon($id);

            return $this->responseSuccess(200, '쿠폰이 성공적으로 삭제되었습니다.');
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '해당 쿠폰을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update coupon active status.
     * PATCH /api/admin/coupons/{id}/status
     */
    public function updateStatus(AdminCouponUpdateStatusRequest $request, int $id): JsonResponse
    {
        try {
            $isActive = $request->boolean('is_active');
            $coupon = $this->adminCouponService->updateStatus($id, $isActive);

            return $this->responseSuccess(200, '쿠폰 상태가 성공적으로 변경되었습니다.', [
                'coupon' => new AdminCouponResource($coupon),
            ]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '해당 쿠폰을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Issue coupon to target users.
     * POST /api/admin/coupons/{id}/issue
     */
    public function issue(AdminCouponIssueRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $result = $this->adminCouponService->issueCoupon($id, $data);

            return $this->responseSuccess(200, '쿠폰이 성공적으로 지급되었습니다.', $result);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '해당 쿠폰을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Issue coupon failed', [
                'coupon_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
