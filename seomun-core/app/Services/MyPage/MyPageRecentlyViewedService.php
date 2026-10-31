<?php

namespace App\Services\MyPage;

use App\Http\Resources\RecentlyViewedProductResource;
use App\Models\Product;
use App\Models\RecentlyViewedProduct;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class MyPageRecentlyViewedService
{
    /**
     * Get recently viewed products for user
     */
    public function getRecentlyViewed(User $user, int $perPage = 20): LengthAwarePaginator
    {
        try {
            $recentlyViewed = RecentlyViewedProduct::forUser($user->id)
                ->with(['product.category', 'product.specification'])
                ->recentlyViewed()
                ->paginate($perPage);

            // Transform to resource
            $recentlyViewed->getCollection()->transform(function ($item) {
                return new RecentlyViewedProductResource($item);
            });

            return $recentlyViewed;
        } catch (\Exception $e) {
            Log::error('Get recently viewed products failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Track product view
     * If user already viewed this product, update viewed_at timestamp
     * Otherwise, create new record
     */
    public function trackProductView(User $user, int $productId): RecentlyViewedProduct
    {
        try {
            // Check if product exists
            $product = Product::findOrFail($productId);

            // Check if already viewed
            $recentlyViewed = RecentlyViewedProduct::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($recentlyViewed) {
                // Update viewed_at timestamp
                $recentlyViewed->update([
                    'viewed_at' => now(),
                ]);
            } else {
                // Create new record
                $recentlyViewed = RecentlyViewedProduct::create([
                    'user_id' => $user->id,
                    'product_id' => $productId,
                    'viewed_at' => now(),
                ]);
            }

            // Clean up old records (keep only last 100 per user)
            $this->cleanupOldRecords($user->id);

            // Load relationships
            $recentlyViewed->load(['product.category', 'product.specification']);

            return $recentlyViewed;
        } catch (ModelNotFoundException $e) {
            throw new \Exception('제품을 찾을 수 없습니다.', 404);
        } catch (\Exception $e) {
            Log::error('Track product view failed', [
                'user_id' => $user->id,
                'product_id' => $productId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Delete specific recently viewed product record
     */
    public function deleteRecentlyViewed(User $user, int $productId): void
    {
        try {
            $deleted = RecentlyViewedProduct::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->delete();

            if ($deleted === 0) {
                throw new \Exception('최근 본 상품을 찾을 수 없습니다.', 404);
            }
        } catch (\Exception $e) {
            Log::error('Delete recently viewed product failed', [
                'user_id' => $user->id,
                'product_id' => $productId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Clear all recently viewed products for user
     */
    public function clearAll(User $user): void
    {
        try {
            RecentlyViewedProduct::where('user_id', $user->id)->delete();
        } catch (\Exception $e) {
            Log::error('Clear all recently viewed products failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Clean up old records, keep only last N records per user
     */
    private function cleanupOldRecords(int $userId, int $keepLimit = 100): void
    {
        try {
            $totalCount = RecentlyViewedProduct::where('user_id', $userId)->count();

            if ($totalCount > $keepLimit) {
                // Get IDs of records to keep (most recent)
                $keepIds = RecentlyViewedProduct::where('user_id', $userId)
                    ->orderBy('viewed_at', 'desc')
                    ->limit($keepLimit)
                    ->pluck('id')
                    ->toArray();

                // Delete old records
                RecentlyViewedProduct::where('user_id', $userId)
                    ->whereNotIn('id', $keepIds)
                    ->delete();
            }
        } catch (\Exception $e) {
            // Don't throw, just log - cleanup is not critical
            Log::warning('Cleanup old recently viewed products failed', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
