<?php

namespace App\Services\MyPage;

use App\Http\Resources\ReviewResource;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyPageReviewService
{
    /**
     * Get user's reviews with filters
     */
    public function getUserReviews(User $user, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        try {
            $query = Review::forUser($user->id)
                ->with(['product.category', 'order'])
                ->recent();

            // Filter by rating
            if (isset($filters['rating']) && $filters['rating']) {
                $query->byRating($filters['rating']);
            }

            // Filter by product
            if (isset($filters['product_id']) && $filters['product_id']) {
                $query->forProduct($filters['product_id']);
            }

            // Filter by published status
            if (isset($filters['published_only']) && $filters['published_only']) {
                $query->published();
            }

            $reviews = $query->paginate($perPage);

            // Transform to resource
            $reviews->getCollection()->transform(function ($item) {
                return new ReviewResource($item);
            });

            return $reviews;
        } catch (\Exception $e) {
            Log::error('Get user reviews failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Create a new review
     */
    public function createReview(User $user, array $data): Review
    {
        try {
            DB::beginTransaction();

            // Check if product exists
            $product = Product::findOrFail($data['product_id']);

            // Check if user already reviewed this product
            $existingReview = Review::where('user_id', $user->id)
                ->where('product_id', $data['product_id'])
                ->where('order_id', $data['order_id'])
                ->first();

            if ($existingReview) {
                throw new \Exception('이미 이 제품에 대한 리뷰를 작성하셨습니다.');
            }

            // Validate rating
            if ($data['rating'] < 1 || $data['rating'] > 5) {
                throw new \Exception('별점은 1부터 5까지 가능합니다.');
            }

            // Create review
            $review = Review::create([
                'user_id' => $user->id,
                'product_id' => $data['product_id'],
                'order_id' => $data['order_id'] ?? null,
                'rating' => $data['rating'],
                'title' => $data['title'],
                'content' => $data['content'],
                'images' => $data['images'] ?? null,
                'is_approved' => true,
                'is_published' => true,
            ]);

            DB::commit();

            // Load relationships
            $review->load(['product.category', 'order']);

            return $review;
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            throw new \Exception('제품을 찾을 수 없습니다.', 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create review failed', [
                'user_id' => $user->id,
                'data' => $data,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Update a review
     */
    public function updateReview(User $user, int $reviewId, array $data): Review
    {
        try {
            DB::beginTransaction();

            $review = Review::findOrFail($reviewId);

            // Check if user owns this review
            if ($review->user_id !== $user->id) {
                throw new \Exception('이 리뷰를 수정할 권한이 없습니다.', 403);
            }

            if ($review->created_at->lt(now()->subDay())) {
                throw new \Exception('리뷰는 작성 후 1일이 지나면 수정할 수 없습니다.', 400);
            }

            $rating = $data['rating'] ?? $review->rating;
            $is_published = $review->is_published === false && $rating > Review::LOW_RATING_THRESHOLD ? true : $review->is_published;

            // Validate rating if provided
            if (isset($data['rating']) && ($data['rating'] < 1 || $data['rating'] > 5)) {
                throw new \Exception('별점은 1부터 5까지 가능합니다.');
            }

            // Update review
            $review->update([
                'rating' => $data['rating'] ?? $review->rating,
                'title' => $data['title'] ?? $review->title,
                'content' => $data['content'] ?? $review->content,
                'images' => $data['images'] ?? $review->images,
                'is_published' => $is_published,
            ]);

            DB::commit();

            // Load relationships
            $review->load(['product.category', 'order']);

            return $review;
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            throw new \Exception('리뷰를 찾을 수 없습니다.', 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update review failed', [
                'user_id' => $user->id,
                'review_id' => $reviewId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Delete a review
     */
    public function deleteReview(User $user, int $reviewId): void
    {
        try {
            DB::beginTransaction();

            $review = Review::findOrFail($reviewId);

            // Check if user owns this review
            if ($review->user_id !== $user->id) {
                throw new \Exception('이 리뷰를 삭제할 권한이 없습니다.', 403);
            }

            // Delete review (soft delete)
            $review->delete();

            DB::commit();
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            throw new \Exception('리뷰를 찾을 수 없습니다.', 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Delete review failed', [
                'user_id' => $user->id,
                'review_id' => $reviewId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get order items that can be reviewed (not yet reviewed by user)
     */
    public function getUnreviewedOrderItems(User $user, int $perPage = 20): LengthAwarePaginator
    {
        try {
            $completedStatuses = [
                \App\Enums\OrderStatus::DeliveryCompleted->value,
                \App\Enums\OrderStatus::Completed->value,
            ];

            $subQuery = OrderItem::query()
                ->selectRaw('MAX(order_items.id) as id')
                ->whereNotExists(function ($query) use ($user) {
                    $query->select(DB::raw(1))
                        ->from('reviews')
                        ->whereColumn('reviews.order_id', 'order_items.order_id')
                        ->whereColumn('reviews.product_id', 'order_items.product_id')
                        ->where('reviews.user_id', $user->id)
                        ->whereNull('reviews.deleted_at');
                })
                ->groupBy('order_items.order_id', 'order_items.product_id');

            return OrderItem::query()
                ->joinSub($subQuery, 'filtered_items', function ($join) {
                    $join->on('order_items.id', '=', 'filtered_items.id');
                })
                ->whereHas('order', function ($query) use ($user, $completedStatuses) {
                    $query->where('user_id', $user->id)
                        ->whereIn('status', $completedStatuses)
                        ->where('payment_status', \App\Enums\PaymentStatus::PAID->value);
                })
                ->with(['product'])
                ->orderByDesc('order_items.created_at')
                ->paginate($perPage);
        } catch (\Exception $e) {
            Log::error('Get unreviewed order items failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
