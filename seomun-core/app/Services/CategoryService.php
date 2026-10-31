<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function __construct(
        protected CategoryRepositoryInterface $categoryRepository,
        protected ProductRepositoryInterface $productRepository,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get all categories
     */
    public function getAllCategories(array $options = []): Collection
    {
        return $this->categoryRepository->getAll($options);
    }

    /**
     * Get category details
     *
     * @throws \Exception
     */
    public function getCategoryDetails(string $slug): Category
    {
        $category = $this->categoryRepository->findWithRelations($slug, ['children', 'parent']);

        if (! $category) {
            throw new \Exception('카테고리를 찾을 수 없습니다.', 404);
        }

        return $category;
    }

    /**
     * Get products for a category
     *
     * @throws \Exception
     */
    public function getCategoryProducts(string $categorySlug, array $filters = [], int $perPage = 15): array
    {
        // Find category
        $category = $this->categoryRepository->findBySlug($categorySlug);

        if (! $category) {
            throw new \Exception('카테고리를 찾을 수 없습니다.', 404);
        }

        // Collect category + descendants
        $categoryIds = $this->getDescendantCategoryIds($category->id);

        // Get products across subtree
        $products = $this->productRepository->getByCategoryIds($categoryIds, $filters, $perPage);

        // Increment exposure count for all products in category results in bulk (avoid N+1 queries)
        $this->bulkIncrementExposureCount($products->items());

        return [
            'category' => $category,
            'products' => $products->items(),
            'pagination' => $this->paginationService->format($products),
        ];
    }

    /**
     * Get all descendant category IDs (including self)
     */
    private function getDescendantCategoryIds(int $categoryId): array
    {
        $ids = [$categoryId];
        $stack = [$categoryId];

        while (! empty($stack)) {
            $currentId = array_pop($stack);
            $children = Category::where('parent_id', $currentId)
                ->active()
                ->pluck('id')
                ->toArray();

            foreach ($children as $childId) {
                if (! in_array($childId, $ids, true)) {
                    $ids[] = $childId;
                    $stack[] = $childId;
                }
            }
        }

        return $ids;
    }

    /**
     * Get root categories (for menu)
     */
    public function getRootCategories(bool $withChildren = false): Collection
    {
        return $this->categoryRepository->getRootCategories($withChildren);
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
