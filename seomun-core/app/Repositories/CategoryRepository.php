<?php

namespace App\Repositories;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository implements CategoryRepositoryInterface
{
    /**
     * Get all categories with optional filters
     */
    public function getAll(array $options = []): Collection
    {
        $query = Category::visible()->orderBy('sort_order', 'asc');

        // Load children recursively if requested
        if ($options['with_children'] ?? false) {
            $query->with('childrenRecursive');
        }

        // Filter to root categories only if requested
        if ($options['root_only'] ?? true) {
            $query->root();
        }

        // Filter by customer — only categories that have at least one product used by this customer
        if (!empty($options['customer_id'])) {
            $query->whereHas('products', function ($q) use ($options) {
                $q->whereHas('customers', function ($q2) use ($options) {
                    $q2->where('customers.id', $options['customer_id']);
                });
            });
        }

        return $query->get();
    }

    /**
     * Find category by slug
     */
    public function findBySlug(string $slug): ?Category
    {
        return Category::where('slug', $slug)
            ->visible()
            ->first();
    }

    /**
     * Get root categories (no parent)
     */
    public function getRootCategories(bool $withChildren = false): Collection
    {
        $query = Category::visible()
            ->root()
            ->orderBy('sort_order', 'asc');

        if ($withChildren) {
            $query->with('childrenRecursive');
        }

        return $query->get();
    }

    /**
     * Get category with relationships
     */
    public function findWithRelations(string $slug, array $with = []): ?Category
    {
        $query = Category::where('slug', $slug)->visible();

        if (! empty($with)) {
            $query->with($with);
        }

        return $query->first();
    }
}
