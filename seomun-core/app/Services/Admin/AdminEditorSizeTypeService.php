<?php

namespace App\Services\Admin;

use App\Models\EditorSizeType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AdminEditorSizeTypeService
{
    public function getSearchFilters(): array
    {
        return [
            'parent_id' => EditorSizeType::whereNull('parent_id')->pluck('name', 'id'),
            'is_active' => [
                'active' => 'Active',
                'hidden' => 'Hidden',
                'all' => 'All',
            ],
        ];
    }

    public function getCategories(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = EditorSizeType::query();

        if (isset($filters['search_keyword']) && ! empty($filters['search_keyword'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search_keyword'] . '%')
                    ->orWhere('code', 'like', '%' . $filters['search_keyword'] . '%');
            });
        }

        if (isset($filters['parent_id']) && ! empty($filters['parent_id'])) {
            $query->where('parent_id', $filters['parent_id']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== 'all') {
            $isActive = $filters['is_active'] === 'active' ? true : false;
            $query->where('is_active', $isActive);
        }

        $query->orderBy('sort_order')
            ->orderBy('name');

        return $query->paginate($perPage);
    }

    public function paginateTreeRoots(LengthAwarePaginator $result, int $page, int $perPage): array
    {
        $result->getCollection()->whereNull('parent_id');
        $result->setCollection($result->getCollection());

        return [
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $result->total(),
            'last_page' => $result->lastPage(),
            'categories' => $result->items(),
        ];
    }

    public function getCategory(int $id): EditorSizeType
    {
        return EditorSizeType::findOrFail($id);
    }

    public function createCategory($adminUser, array $data): EditorSizeType
    {
        return DB::transaction(function () use ($data) {
            $category = $category = EditorSizeType::create([
                'name' => $data['name'],
                'parent_id' => $data['parent_id'] ?? null,
                'sort_order' => $data['sort_order'] ?? null,
                'is_active' => match ($data['is_active'] ?? null) {
                    'active', 1, '1', true => 1,
                    'inactive', 0, '0', false => 0,
                    default => 1,
                },
            ]);

            // Set sort_order if not provided
            if (empty($data['sort_order'])) {
                $maxSortOrder = EditorSizeType::whereNull('parent_id')
                    ->where('parent_id', $data['parent_id'] ?? null)
                    ->max('sort_order');
                $category->sort_order = $maxSortOrder ? $maxSortOrder + 1 : 0;
                $category->save();
            }

            return $category;
        });
    }

    public function updateCategory(int $id, array $data): EditorSizeType
    {
        $category = $this->getCategory($id);

        // Prevent self parent
        if (isset($data['parent_id']) && $data['parent_id'] == $id) {
            throw new \Exception('상위 카테고리는 현재 카테고리와 동일할 수 없습니다.');
        }

        if (array_key_exists('is_active', $data)) {
            $data['is_active'] = match ($data['is_active']) {
                'active', 1, '1', true => 1,
                'inactive', 0, '0', false => 0,
                default => $category->is_active,
            };
        }

        $category->fill($data);
        $category->save();

        return $category;
    }

    public function deleteCategory(int $id): void
    {
        $category = $this->getCategory($id);

        // Check if category has children
        if ($category->children()->count() > 0) {
            throw new \Exception('하위 카테고리가 존재하는 카테고리는 삭제할 수 없습니다.');
        }

        // Check if category has sizes
        if ($category->sizes()->count() > 0) {
            throw new \Exception('연결된 사이즈가 존재하는 카테고리는 삭제할 수 없습니다.');
        }

        $category->delete();
    }

    public function updateSortOrder(array $categories): void
    {
        DB::transaction(function () use ($categories) {
            foreach ($categories as $categoryData) {
                if (!isset($categoryData['id'])) {
                    continue;
                }
                $category = EditorSizeType::find($categoryData['id']);
                if ($category) {
                    $category->sort_order = $categoryData['sort_order'] ?? $category->sort_order ?? 0;
                    $category->save();

                    // Update children recursively
                    if (! empty($categoryData['children'])) {
                        $this->updateSortOrder($categoryData['children']);
                    }
                }
            }
        });
    }

    public function getCategoriesTree(?int $parentId = null): Collection
    {
        $query = EditorSizeType::whereNull('parent_id');

        if ($parentId !== null) {
            $query->where('parent_id', $parentId);
        }

        return $query->with(['childrenRecursive'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    public function getCategoriesFlat(): Collection
    {
        return EditorSizeType::with(['parent'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }
}
