<?php

namespace App\Services\Admin;

use App\Models\EditorSize;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AdminEditorSizeService
{
    public function getSearchFilters(): array
    {
        return [
            'editor_size_type_id' => \App\Models\EditorSizeType::where('is_active', true)->pluck('name', 'id'),
            'is_active' => [
                'true' => 'Active',
                'false' => 'Inactive',
                'all' => 'All',
            ],
        ];
    }

    public function getCategories(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = EditorSize::query();

        if (isset($filters['search_keyword']) && ! empty($filters['search_keyword'])) {
            $query->where('name', 'like', '%'.$filters['search_keyword'].'%');
        }

        if (isset($filters['editor_size_type_id']) && ! empty($filters['editor_size_type_id'])) {
            $query->where('editor_size_type_id', $filters['editor_size_type_id']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== 'all') {
            $isActive = $filters['is_active'] === 'true' ? true : false;
            $query->where('is_active', $isActive);
        }

        $query->with(['sizeType'])
            ->orderBy('created_at', 'desc')
            ->orderBy('name');

        return $query->paginate($perPage);
    }

    public function getSize(int $id): EditorSize
    {
        return EditorSize::findOrFail($id);
    }

    public function createSize($adminUser, array $data): EditorSize
    {
        return DB::transaction(function () use ($data) {
            $size = EditorSize::create($data);

            return $size;
        });
    }

    public function updateSize(int $id, array $data): EditorSize
    {
        $size = $this->getSize($id);
        $size->fill($data);
        $size->save();

        return $size;
    }

    public function deleteSize(int $id): void
    {
        $size = $this->getSize($id);
        $size->delete();
    }

    public function updateSortOrder(array $sizes): void
    {
        DB::transaction(function () use ($sizes) {
            foreach ($sizes as $sizeData) {
                $size = EditorSize::find($sizeData['id']);
                if ($size) {
                    $size->sort_order = $sizeData['sort_order'];
                    $size->save();
                }
            }
        });
    }

    public function getSizesByType(int $typeId): Collection
    {
        return EditorSize::where('editor_size_type_id', $typeId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }
}
