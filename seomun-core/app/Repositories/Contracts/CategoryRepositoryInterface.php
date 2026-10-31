<?php

namespace App\Repositories\Contracts;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

interface CategoryRepositoryInterface
{
    /**
     * Get all categories with optional filters
     */
    public function getAll(array $options = []): Collection;

    /**
     * Find category by slug
     */
    public function findBySlug(string $slug): ?Category;

    /**
     * Get root categories (no parent)
     */
    public function getRootCategories(bool $withChildren = false): Collection;

    /**
     * Get category with relationships
     */
    public function findWithRelations(string $slug, array $with = []): ?Category;
}
