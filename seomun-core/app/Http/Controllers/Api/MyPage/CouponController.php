<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MyPage\RegisterCouponRequest;
use App\Http\Resources\UserCouponResource;
use App\Services\MyPage\MyPageCouponService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CouponController extends BaseController
{
    public function __construct(
        protected MyPageCouponService $couponService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get user's coupons (내 쿠폰 목록)
     * GET /api/mypage/coupons
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $filters = [
                'status' => $request->get('status'),
                'available_only' => $request->boolean('available_only'),
            ];
            $perPage = (int) $request->get('per_page', 20);

            $result = $this->couponService->getUserCoupons($user, $filters, $perPage);
            $userCoupons = $result['paginator'];
            $counts = $result['counts'];

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'coupons' => $userCoupons->items(),
                'counts' => $counts,
            ], $this->paginationService->format($userCoupons));
        } catch (\Throwable $e) {
            Log::error('Get user coupons failed', [
                'user_id' => $request->user()->id ?? null,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '쿠폰 목록을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * Get available coupons to claim (받을 수 있는 쿠폰 목록)
     * GET /api/mypage/coupons/available
     */
    public function available(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $perPage = (int) $request->get('per_page', 20);

            $coupons = $this->couponService->getAvailableCoupons($user, $perPage);

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'coupons' => $coupons->items(),
            ], $this->paginationService->format($coupons));
        } catch (\Throwable $e) {
            Log::error('Get available coupons failed', [
                'user_id' => $request->user()->id ?? null,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '받을 수 있는 쿠폰 목록을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * Claim a coupon (쿠폰 받기)
     * POST /api/mypage/coupons/{couponId}/claim
     */
    public function claim(Request $request, int $couponId): JsonResponse
    {
        try {
            $user = $request->user();
            $userCoupon = $this->couponService->claimCoupon($user, $couponId);

            return response()->json([
                'success' => true,
                'message' => '쿠폰을 받았습니다.',
                'data' => [
                    'user_coupon' => new UserCouponResource($userCoupon),
                ],
            ], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '쿠폰을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Claim coupon failed', [
                'user_id' => $request->user()->id,
                'coupon_id' => $couponId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: '쿠폰을 받는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get benefits information (혜택 정보)
     * GET /api/mypage/benefits
     */
    public function benefits(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $benefits = $this->couponService->getBenefits($user);

            return response()->json([
                'success' => true,
                'data' => [
                    'benefits' => $benefits,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get benefits failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '혜택 정보를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
