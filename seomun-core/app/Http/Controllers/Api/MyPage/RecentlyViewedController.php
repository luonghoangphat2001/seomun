<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\RecentlyViewedProductResource;
use App\Services\MyPage\MyPageRecentlyViewedService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RecentlyViewedController extends BaseController
{
    public function __construct(
        protected MyPageRecentlyViewedService $recentlyViewedService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get recently viewed products (최근 본 상품 조회)
     * GET /api/mypage/recently-viewed
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $perPage = (int) $request->get('per_page', 20);

            $recentlyViewed = $this->recentlyViewedService->getRecentlyViewed($user, $perPage);

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'recently_viewed' => $recentlyViewed->items(),
            ], $this->paginationService->format($recentlyViewed));
        } catch (\Throwable $e) {
            Log::error('Get recently viewed products failed', [
                'user_id' => $request->user()->id ?? null,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '최근 본 상품을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * Track product view (상품 조회 추적)
     * POST /api/mypage/recently-viewed/{productId}
     */
    public function track(Request $request, int $productId): JsonResponse
    {
        try {
            $user = $request->user();
            $recentlyViewed = $this->recentlyViewedService->trackProductView($user, $productId);

            return response()->json([
                'success' => true,
                'message' => '상품 조회가 기록되었습니다.',
                'data' => [
                    'recently_viewed' => new RecentlyViewedProductResource($recentlyViewed),
                ],
            ], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '상품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Track product view failed', [
                'user_id' => $request->user()->id,
                'product_id' => $productId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: '상품 조회를 기록하는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete specific recently viewed product (최근 본 상품 삭제)
     * DELETE /api/mypage/recently-viewed/{productId}
     */
    public function destroy(Request $request, int $productId): JsonResponse
    {
        try {
            $user = $request->user();
            $this->recentlyViewedService->deleteRecentlyViewed($user, $productId);

            return response()->json([
                'success' => true,
                'message' => '최근 본 상품이 삭제되었습니다.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete recently viewed product failed', [
                'user_id' => $request->user()->id,
                'product_id' => $productId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $statusCode = str_contains($e->getMessage(), '찾을 수 없습니다') ? 404 : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: '최근 본 상품을 삭제하는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $statusCode);
        }
    }

    /**
     * Clear all recently viewed products (전체 삭제)
     * DELETE /api/mypage/recently-viewed
     */
    public function clearAll(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $this->recentlyViewedService->clearAll($user);

            return response()->json([
                'success' => true,
                'message' => '모든 최근 본 상품이 삭제되었습니다.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Clear all recently viewed products failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '최근 본 상품을 삭제하는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
