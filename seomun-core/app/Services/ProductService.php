<?php

namespace App\Services;

use App\Events\ProductViewed;
use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProductService
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository
    ) {}

    /**
     * Get paginated product list
     */
    public function getProductList(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $products = $this->productRepository->getPaginated($filters, $perPage);

        // Increment exposure count for all products in bulk (avoid N+1 queries)
        $this->bulkIncrementExposureCount($products->items());

        return $products;
    }

    /**
     * Get product details by slug
     *
     * @throws \Exception
     */
    public function getProductDetails(string $slug): ?Product
    {
        $product = $this->productRepository->findBySlug($slug);

        if (! $product) {
            throw new \Exception('제품을 찾을 수 없습니다.', 404);
        }

        // Increment view count
        $this->productRepository->incrementViewCount($product);

        // Dispatch event for tracking, analytics, recommendations, etc.
        event(new ProductViewed($product));

        return $product;
    }

    /**
     * Get popular products
     */
    public function getPopularProducts(int $limit = 10): Collection
    {
        $products = $this->productRepository->getPopular($limit);

        // Increment exposure count for all popular products in bulk (avoid N+1 queries)
        $this->bulkIncrementExposureCount($products);

        return $products;
    }

    /**
     * Search products
     *
     * @throws \Exception
     */
    public function searchProducts(string $keyword, array $filters = [], int $perPage = 15, bool $includeChildCategory = false): LengthAwarePaginator
    {
        $products = $this->productRepository->search($keyword, $filters, $perPage, $includeChildCategory);
        
        // Increment exposure count for all products in search results in bulk (avoid N+1 queries)
        $this->bulkIncrementExposureCount($products->items());

        return $products;
    }

    /**
     * Get products by category
     */
    public function getProductsByCategory(int $categoryId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $products = $this->productRepository->getByCategory($categoryId, $filters, $perPage);

        // Increment exposure count for all products in category results in bulk (avoid N+1 queries)
        $this->bulkIncrementExposureCount($products->items());

        return $products;
    }

    /**
     * Bulk increment exposure count for multiple products (avoid N+1 queries)
     *
     * @param  array|Collection  $products
     */
    private function bulkIncrementExposureCount($products): void
    {
        if (empty($products)) {
            return;
        }

        $productIds = collect($products)->pluck('id')->filter();

        if ($productIds->isNotEmpty()) {
            // Single database query to increment all exposure counts
            Product::whereIn('id', $productIds)->increment('exposure_count');
        }
    }
}
