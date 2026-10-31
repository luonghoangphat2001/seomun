<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminCategoryResource;
use App\Models\Category;
use App\Models\User;
use App\Services\PaginationService;
// use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminCategoryService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for categories.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        return [
            'status_options' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'hidden', 'label' => 'Hidden'],
            ],
            'best_options' => [
                ['value' => true, 'label' => 'Best'],
                ['value' => false, 'label' => 'Normal'],
            ],
            'category_levels' => [
                ['value' => 'large', 'label' => 'Large Category'],
                ['value' => 'medium', 'label' => 'Medium Category'],
                ['value' => 'small', 'label' => 'Small Category'],
            ],
        ];
    }

    /**
     * Get categories with filters for Super Admin.
     * Returns tree structure.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>|LengthAwarePaginator
     */
    public function getCategories(array $filters, int $perPage = 20): array|LengthAwarePaginator
    {
        $query = Category::query()->with(['parent', 'createdBy']);

        // Generic filters aligned with FE
        $name = Arr::get($filters, 'name');
        $code = Arr::get($filters, 'code');
        $slug = Arr::get($filters, 'slug');
        $level = Arr::get($filters, 'level'); // large, medium, small

        if ($name) {
            $query->where(function (Builder $q) use ($name) {
                $q->where('name', 'like', '%'.$name.'%')
                    ->orWhere('name_en', 'like', '%'.$name.'%')
                    ->orWhere('name_ja', 'like', '%'.$name.'%');
            });
        }

        if ($code) {
            $query->where('code', 'like', '%'.$code.'%');
        }

        if ($slug) {
            $query->where('slug', 'like', '%'.$slug.'%');
        }

        // Level filter based on tree depth
        if ($level === 'large') {
            // Root categories only
            $query->whereNull('parent_id');
        } elseif ($level === 'medium') {
            // Direct children of root
            $query->whereNotNull('parent_id')
                ->whereHas('parent', function (Builder $p) {
                    $p->whereNull('parent_id');
                });
        } elseif ($level === 'small') {
            // Children of medium categories (grandchildren of root)
            $query->whereNotNull('parent_id')
                ->whereHas('parent', function (Builder $p) {
                    $p->whereNotNull('parent_id');
                });
        }

        // Legacy filters by large/medium/small category name (still supported)
        $largeCategoryName = Arr::get($filters, 'large_category_name');
        $mediumCategoryName = Arr::get($filters, 'medium_category_name');
        $smallCategoryName = Arr::get($filters, 'small_category_name');

        if ($largeCategoryName) {
            $query->where(function (Builder $q) use ($largeCategoryName) {
                $q->whereNull('parent_id')
                    ->where('name', 'like', '%'.$largeCategoryName.'%');
            });
        }

        /**
         * MEDIUM (FIX):
         * Assumption (most common): medium = level-2 category (has parent; parent is root)
         * - category.parent_id is not null
         * - category.name like %medium%
         * - parent.parent_id is null
         */
        if ($mediumCategoryName) {
            $query->where(function (Builder $q) use ($mediumCategoryName) {
                $q->whereNotNull('parent_id')
                    ->where('name', 'like', '%'.$mediumCategoryName.'%')
                    ->whereHas('parent', function (Builder $p) {
                        $p->whereNull('parent_id');
                    });
            });
        }

        /**
         * SMALL:
         * Assumption: small = level-3 category (has parent; parent is medium (parent_id not null))
         */
        if ($smallCategoryName) {
            $query->where('name', 'like', '%'.$smallCategoryName.'%')
                ->whereHas('parent', function (Builder $q) {
                    $q->whereNotNull('parent_id');
                });
        }

        // Filter by status (active/hidden)
        $status = Arr::get($filters, 'status');
        if ($status) {
            $query->where('is_active', $status === 'active');
        }

        $isBest = Arr::get($filters, 'is_best');
        if ($isBest !== null) {
            $query->where('is_best', (bool) $isBest);
        }

        // Filter by registrant
        $registrant = Arr::get($filters, 'registrant');
        if ($registrant) {
            $query->whereHas('createdBy', function (Builder $builder) use ($registrant) {
                $builder->where('username', 'like', '%'.$registrant.'%')
                    ->orWhere('name', 'like', '%'.$registrant.'%')
                    ->orWhere('email', 'like', '%'.$registrant.'%');
            });
        }

        // Exposure period filters (Exposure Start Date - End Date) for FE search
        $exposureStartFrom = Arr::get($filters, 'exposure_start_date_from');
        $exposureStartTo = Arr::get($filters, 'exposure_start_date_to');
        $exposureEndFrom = Arr::get($filters, 'exposure_end_date_from');
        $exposureEndTo = Arr::get($filters, 'exposure_end_date_to');
        if ($exposureStartFrom !== null) {
            $query->where(function (Builder $q) use ($exposureStartFrom) {
                $q->whereDate('exposure_start_date', '>=', $exposureStartFrom);
            });
        }
        if ($exposureStartTo !== null) {
            $query->where(function (Builder $q) use ($exposureStartTo) {
                $q->whereNotNull('exposure_start_date')->whereDate('exposure_start_date', '<=', $exposureStartTo);
            });
        }
        if ($exposureEndFrom !== null) {
            $query->where(function (Builder $q) use ($exposureEndFrom) {
                $q->whereNull('exposure_end_date')->orWhereDate('exposure_end_date', '>=', $exposureEndFrom);
            });
        }
        if ($exposureEndTo !== null) {
            $query->where(function (Builder $q) use ($exposureEndTo) {
                $q->whereNotNull('exposure_end_date')->whereDate('exposure_end_date', '<=', $exposureEndTo);
            });
        }

        // Sort
        $sortBy = Arr::get($filters, 'sort_by', 'sort_order');
        $sortOrder = Arr::get($filters, 'sort_order', 'asc');

        // Map sort_by to actual column
        $sortColumn = match ($sortBy) {
            'name' => 'name',
            'status' => 'is_active',
            'is_best' => 'is_best',
            'created_at' => 'created_at',
            default => 'sort_order',
        };

        // tree = true  → response SHAPE is nested: categories[].children (tree view). Pagination is by ROOT nodes.
        // tree = false → response SHAPE is flat list: categories[] with no children. Pagination is by all rows.
        $treeStructure = Arr::get($filters, 'tree', true);
        if ($treeStructure) {
            $query->orderByRaw('CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END ASC')
                ->orderBy('parent_id', 'asc')
                ->orderBy($sortColumn, $sortOrder);
        } else {
            $query->orderBy($sortColumn, $sortOrder);
        }

        if ($treeStructure) {
            // Get all matching rows, build nested tree (roots with children), then controller paginates roots
            $categories = $query->get();
            $categories = $this->ensureTreeHasRoots($categories);

            return $this->buildTree($categories);
        }

        // Flat list: paginate at DB (one page of categories, no nesting)
        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * When filters (e.g. registrant) return only children, tree would have 0 roots.
     * Load ancestor categories so the tree has roots and can display the matching branch.
     *
     * @param  Collection<int, Category>  $categories  Filtered categories
     * @return Collection<int, Category>
     */
    protected function ensureTreeHasRoots(Collection $categories): Collection
    {
        if ($categories->isEmpty()) {
            return $categories;
        }
        if ($categories->contains(fn (Category $c) => $c->parent_id === null)) {
            return $categories;
        }

        $haveIds = $categories->pluck('id')->flip()->all();
        $toLoad = [];
        foreach ($categories->pluck('parent_id')->filter()->unique() as $pid) {
            if (! isset($haveIds[$pid])) {
                $toLoad[$pid] = true;
            }
        }
        while (! empty($toLoad)) {
            $parents = Category::whereIn('id', array_keys($toLoad))->get();
            $toLoad = [];
            foreach ($parents as $p) {
                $categories->push($p);
                $haveIds[$p->id] = true;
                if ($p->parent_id !== null && ! isset($haveIds[$p->parent_id])) {
                    $toLoad[$p->parent_id] = true;
                }
            }
        }

        return $categories;
    }

    /**
     * Build tree structure from flat category collection.
     *
     * @return array<string, mixed>
     */
    protected function buildTree(Collection $categories): array
    {
        $tree = [];
        $indexed = [];

        // Index all categories by ID
        foreach ($categories as $category) {
            $indexed[$category->id] = $category;
        }

        // Build tree
        foreach ($categories as $category) {
            if ($category->parent_id === null) {
                $tree[] = $this->buildCategoryNode($category, $indexed);
            }
        }

        return [
            'categories' => $tree,
            'total' => $categories->count(),
        ];
    }

    /**
     * Build a category node with children recursively.
     *
     * @param  array<int, Category>  $indexed
     * @return array<string, mixed>
     */
    protected function buildCategoryNode(Category $category, array $indexed): array
    {
        $data = (new AdminCategoryResource($category))->resolve();

        $children = [];
        foreach ($indexed as $child) {
            if ((int) $child->parent_id === (int) $category->id) {
                $children[] = $this->buildCategoryNode($child, $indexed);
            }
        }

        // Sort children by sort_order for stability
        if (! empty($children)) {
            usort(
                $children,
                fn ($a, $b) => ($a['sort_order'] ?? 0) <=> ($b['sort_order'] ?? 0)
            );
        }

        $data['children'] = $children;

        return $data;
    }

    /**
     * Get single category detail.
     */
    public function getCategory(int $id): Category
    {
        return Category::with(['parent', 'createdBy', 'allChildren.parent'])->findOrFail($id);
    }

    /**
     * Create a new category.
     *
     * @param  array<string, mixed>  $data
     */
    public function createCategory(User $adminUser, array $data): Category
    {
        return DB::transaction(function () use ($adminUser, $data) {
            // Generate slug if not provided
            $slug = $data['slug'] ?? \Str::slug($data['name']);

            // Ensure unique slug
            $baseSlug = $slug;
            $counter = 1;
            while (Category::where('slug', $slug)->exists()) {
                $slug = $baseSlug.'-'.$counter;
                $counter++;
            }

            return Category::create([
                'name' => $data['name'],
                'name_en' => $data['name_en'] ?? null,
                'name_ja' => $data['name_ja'] ?? null,
                'slug' => $slug,
                'code' => $data['code'] ?? null,
                'parent_id' => $data['parent_id'] ?? null,
                'description' => $data['description'] ?? null,
                'image' => $data['image'] ?? null,
                'icon' => $data['icon'] ?? null,
                'banner_image' => $data['banner_image'] ?? null,
                'sort_order' => $data['sort_order'] ?? 0,
                'exposure_order' => $data['exposure_order'] ?? null,
                'is_active' => $data['status'] === 'active',
                'is_best' => (bool) ($data['is_best'] ?? false),
                'created_by' => $adminUser->id,
                'exposure_start_date' => $data['exposure_start_date'] ?? null,
                'exposure_end_date' => $data['exposure_end_date'] ?? null,
            ]);
        });
    }

    /**
     * Update an existing category.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateCategory(int $id, array $data): Category
    {
        return DB::transaction(function () use ($id, $data) {
            $category = Category::findOrFail($id);

            $updateData = [];

            if (isset($data['name'])) {
                $updateData['name'] = $data['name'];
            }
            if (isset($data['name_en'])) {
                $updateData['name_en'] = $data['name_en'];
            }
            if (array_key_exists('name_ja', $data)) {
                $updateData['name_ja'] = $data['name_ja'];
            }
            if (isset($data['code'])) {
                $updateData['code'] = $data['code'];
            }
            // array_key_exists: allow explicit parent_id = null (isset is false when value is null)
            if (array_key_exists('parent_id', $data)) {
                $updateData['parent_id'] = $data['parent_id'];
            }
            if (isset($data['description'])) {
                $updateData['description'] = $data['description'];
            }
            if (array_key_exists('image', $data)) {
                $updateData['image'] = $data['image'] !== '' ? $data['image'] : null;
            }
            if (array_key_exists('icon', $data)) {
                $updateData['icon'] = $data['icon'] !== '' ? $data['icon'] : null;
            }
            if (isset($data['sort_order'])) {
                $newOrder = (int) $data['sort_order'];
                $oldOrder = (int) $category->sort_order;
                if ($oldOrder !== $newOrder) {
                    $siblings = Category::query()
                        ->where('parent_id', $category->parent_id)
                        ->where('id', '!=', $category->id);

                    if ($newOrder < $oldOrder) {
                        // Moving up (e.g. 46 → 2): shift only [newOrder, oldOrder) down by 1. Do not touch sort_order 1.
                        $siblings->where('sort_order', '>=', $newOrder)
                            ->where('sort_order', '<', $oldOrder)
                            ->increment('sort_order');
                    } else {
                        // Moving down (e.g. 2 → 46): shift (oldOrder, newOrder] up by 1.
                        $siblings->where('sort_order', '>', $oldOrder)
                            ->where('sort_order', '<=', $newOrder)
                            ->decrement('sort_order');
                    }
                }
                $updateData['sort_order'] = $newOrder;
            }
            if (isset($data['status'])) {
                $updateData['is_active'] = $data['status'] === 'active';
            }
            if (array_key_exists('is_best', $data)) {
                $updateData['is_best'] = (bool) $data['is_best'];
            }
            if (array_key_exists('banner_image', $data)) {
                $updateData['banner_image'] = $data['banner_image'] !== '' ? $data['banner_image'] : null;
            }
            if (array_key_exists('exposure_start_date', $data)) {
                $updateData['exposure_start_date'] = $data['exposure_start_date'];
            }
            if (array_key_exists('exposure_end_date', $data)) {
                $updateData['exposure_end_date'] = $data['exposure_end_date'];
            }

            $category->update($updateData);

            return $category;
        });
    }

    /**
     * Update category exposure information.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateCategoryExposure(int $id, array $data): Category
    {
        return DB::transaction(function () use ($id, $data) {
            $category = Category::findOrFail($id);

            $updateData = [];

            if (isset($data['exposure_order'])) {
                $newOrder = (int) $data['exposure_order'];
                if ($category->exposure_order !== $newOrder) {
                    // Avoid duplicate: shift other categories with exposure_order >= new value
                    Category::query()
                        ->where('id', '!=', $category->id)
                        ->whereNotNull('exposure_order')
                        ->where('exposure_order', '>=', $newOrder)
                        ->increment('exposure_order');
                }
                $updateData['exposure_order'] = $newOrder;
            }
            if (isset($data['banner_image'])) {
                $updateData['banner_image'] = $data['banner_image'];
            }
            if (isset($data['icon_image'])) {
                $updateData['icon'] = $data['icon_image'];
            }
            if (isset($data['exposure_start_date'])) {
                $updateData['exposure_start_date'] = $data['exposure_start_date'];
            }
            if (isset($data['exposure_end_date'])) {
                $updateData['exposure_end_date'] = $data['exposure_end_date'];
            }

            $category->update($updateData);

            return $category;
        });
    }

    /**
     * Update category sort order (drag-and-drop).
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    public function updateSortOrder(array $items): void
    {
        DB::transaction(function () use ($items) {
            foreach ($items as $item) {
                Category::where('id', $item['id'])
                    ->update(['sort_order' => $item['sort_order']]);
            }
        });
    }

    /**
     * Delete a category.
     */
    public function deleteCategory(int $id): void
    {
        DB::transaction(function () use ($id) {
            $category = Category::findOrFail($id);

            // Check if category has children
            if ($category->children()->count() > 0) {
                throw new \Exception('하위 카테고리가 있는 카테고리는 삭제할 수 없습니다. 먼저 하위 카테고리를 삭제하거나 이동해 주세요.');
            }

            $category->delete();
        });
    }

    /**
     * Format list response with pagination and resources.
     *
     * @return array<string, mixed>
     */
    public function formatListResponse(LengthAwarePaginator $paginator): array
    {
        return [
            'categories' => AdminCategoryResource::collection($paginator->items()),
            'pagination' => $this->paginationService->format($paginator),
        ];
    }

    /**
     * NEW: Standardize tree response to always include pagination format.
     * This makes FE contract consistent.
     *
     * @param  array<string, mixed>  $treeResult  (from buildTree)
     * @return array<string, mixed>
     */
    public function formatTreeResponse(array $treeResult, int $perPage): array
    {
        $totalItem = (int) ($treeResult['total'] ?? 0);

        // Option A (recommended for tree): per_page reflects actual returned items
        // $perPageForTree = max($totalItem, 1);

        // Option B: keep requested per_page (even though tree returns all)
        $perPageForTree = $perPage;

        return [
            'categories' => $treeResult['categories'] ?? [],
            'pagination' => [
                'current_page' => 1,
                'per_page' => $perPageForTree,
                'total_page' => 1,
                'total_item' => $totalItem,
            ],
        ];
    }

    /**
     * Paginate tree by ROOT nodes (safe, does not break parent-child structure)
     */
    public function paginateTreeRoots(array $treeResult, int $page = 1, int $perPage = 20): array
    {
        $roots = collect($treeResult['categories']); // ROOT nodes

        $paginator = new LengthAwarePaginator(
            $roots->forPage($page, $perPage)->values(),
            $roots->count(),        // total ROOT
            $perPage,
            $page
        );

        return [
            'categories' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total_page' => $paginator->lastPage(),
                'total_item' => $paginator->total(),
            ],
        ];
    }
}
