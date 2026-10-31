<?php

namespace App\Repositories;

use App\Enums\ProductSortField;
use App\Models\Category;
use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository implements ProductRepositoryInterface
{
    /**
     * Get paginated products with optional filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Product::with($this->listRelations())->active();

        // Apply category filter
        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Apply sorting with validation
        $sortField = $this->validateSortField($filters['sort_by'] ?? null);
        $sortDirection = $this->validateSortDirection($filters['sort_order'] ?? null);

        $query->orderBy($sortField, $sortDirection);

        return $query->paginate($perPage);
    }

    /**
     * Find product by slug
     */
    public function findBySlug(string $slug): ?Product
    {
        return Product::with($this->defaultRelations())
            ->where('slug', $slug)
            ->active()
            ->first();
    }

    /**
     * Get popular products
     */
    public function getPopular(int $limit = 10): Collection
    {
        return Product::with($this->listRelations())
            ->popular()
            ->orderBy('view_count', 'desc')
            ->orderBy('sort_order', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Search products by keyword
     */
    public function search(string $keyword, array $filters = [], int $perPage = 15, bool $includeChildCategory = false): LengthAwarePaginator
    {
        $query = Product::with($this->listRelations())
            ->active()
            ->search($keyword);

        if (isset($filters['category_id'])) {
            if ($includeChildCategory) {
                $childCategoryIds = Category::where('parent_id', $filters['category_id'])->pluck('id')->toArray();
                $categoryIds = array_merge([$filters['category_id']], $childCategoryIds);
                $query->whereIn('category_id', $categoryIds);
            } else {
                $query->where('category_id', $filters['category_id']);
            }
        }

        return $query->orderBy('view_count', 'desc')->paginate($perPage);
    }

    /**
     * Increment view count for a product
     */
    public function incrementViewCount(Product $product): void
    {
        $product->incrementViewCount();
    }

    /**
     * Increment exposure count for a product
     */
    public function incrementExposureCount(Product $product): void
    {
        $product->incrementExposureCount();
    }

    /**
     * Get products by category
     */
    public function getByCategory(int $categoryId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Product::with($this->listRelations())
            ->where('category_id', $categoryId)
            ->where('is_active', true);

        // Apply sorting with validation
        $sortField = $this->validateSortField($filters['sort_by'] ?? null);
        $sortDirection = $this->validateSortDirection($filters['sort_order'] ?? null);

        $query->orderBy($sortField, $sortDirection);

        return $query->paginate($perPage);
    }

    /**
     * Get products by multiple category IDs
     */
    public function getByCategoryIds(array $categoryIds, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Product::with($this->listRelations())
            ->whereIn('category_id', $categoryIds)
            ->where('is_active', true);

        // Apply sorting with validation
        $sortField = $this->validateSortField($filters['sort_by'] ?? null);
        $sortDirection = $this->validateSortDirection($filters['sort_order'] ?? null);

        $query->orderBy($sortField, $sortDirection);

        return $query->paginate($perPage);
    }

    /**
     * Validate and return safe sort field
     */
    private function validateSortField(?string $field): string
    {
        return ProductSortField::isValid($field) ? $field : 'sort_order';
    }

    /**
     * Validate and return safe sort direction
     */
    private function validateSortDirection(?string $direction): string
    {
        return in_array(strtolower($direction ?? ''), ['asc', 'desc'])
            ? strtolower($direction)
            : 'asc';
    }

    private function listRelations(): array
    {
        return ['category'];
    }

    private function defaultRelations(): array
    {
        return [
            'category',
            'specification',
            'optionGroups.options',
            'quantityPrices',
            'shoppingSettingItems.setting',
        ];
    }
}
