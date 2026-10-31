<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MyPage\StoreReviewRequest;
use App\Http\Requests\MyPage\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Services\MyPage\MyPageReviewService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReviewController extends BaseController
{
    public function __construct(
        protected MyPageReviewService $reviewService,
        protected PaginationService $paginationService
    ) {}

    /**
     * GET /api/mypage/reviews
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user    = $request->user();
            $filters = [
                'rating'         => $request->get('rating'),
                'product_id'     => $request->get('product_id'),
                'published_only' => $request->boolean('published_only'),
            ];
            $perPage = (int) $request->get('per_page', 20);

            $reviews = $this->reviewService->getUserReviews($user, $filters, $perPage);

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'reviews' => $reviews->items(),
            ], $this->paginationService->format($reviews));
        } catch (\Throwable $e) {
            Log::error('Get user reviews failed', [
                'user_id' => $request->user()->id ?? null,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '리뷰 목록을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * POST /api/mypage/reviews
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        try {
            $review = $this->reviewService->createReview($request->user(), $request->validated());

            return $this->responseSuccess(201, '리뷰가 작성되었습니다. (관리자 승인 후 발행됩니다)', [
                'review' => new ReviewResource($review),
            ]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '제품을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Create review failed', [
                'user_id' => $request->user()->id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(400, $e->getMessage() ?: '리뷰를 작성하는 중 오류가 발생했습니다.');
        }
    }

    /**
     * PUT /api/mypage/reviews/{reviewId}
     */
    public function update(UpdateReviewRequest $request, int $reviewId): JsonResponse
    {
        try {
            $review = $this->reviewService->updateReview($request->user(), $reviewId, $request->validated());

            return $this->responseSuccess(200, '리뷰가 수정되었습니다. (관리자 승인 후 발행됩니다)', [
                'review' => new ReviewResource($review),
            ]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '리뷰를 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Update review failed', [
                'user_id'   => $request->user()->id,
                'review_id' => $reviewId,
                'error'     => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            $statusCode = str_contains($e->getMessage(), '권한이 없습니다') || str_contains($e->getMessage(), '수정할 수 없습니다') ? 403 : 400;

            return $this->responseError($statusCode, $e->getMessage() ?: '리뷰를 수정하는 중 오류가 발생했습니다.');
        }
    }

    /**
     * DELETE /api/mypage/reviews/{reviewId}
     */
    public function destroy(Request $request, int $reviewId): JsonResponse
    {
        try {
            $this->reviewService->deleteReview($request->user(), $reviewId);

            return $this->responseSuccess(200, '리뷰가 삭제되었습니다.');
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '리뷰를 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Delete review failed', [
                'user_id'   => $request->user()->id,
                'review_id' => $reviewId,
                'error'     => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            $statusCode = str_contains($e->getMessage(), '권한이 없습니다') ? 403 : 500;

            return $this->responseError($statusCode, $e->getMessage() ?: '리뷰를 삭제하는 중 오류가 발생했습니다.');
        }
    }

    /**
     * GET /api/mypage/order-items/unreviewed
     */
    public function unreviewedOrderItems(Request $request): JsonResponse
    {
        try {
            $perPage    = (int) $request->get('per_page', 20);
            $orderItems = $this->reviewService->getUnreviewedOrderItems($request->user(), $perPage);

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'order_items' => $orderItems->items(),
            ], $this->paginationService->format($orderItems));
        } catch (\Throwable $e) {
            Log::error('Get unreviewed order items failed', [
                'user_id' => $request->user()->id ?? null,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '리뷰 가능한 주문상품 목록을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }
}
