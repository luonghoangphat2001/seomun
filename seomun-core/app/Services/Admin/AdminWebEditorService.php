<?php

namespace App\Services\Admin;

use App\Enums\WebEditorType;
use App\Models\WebEditor;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminWebEditorService
{
    public function getSearchFilters(): array
    {
        return [
            'types' => collect(WebEditorType::cases())->mapWithKeys(fn($case) => [
                $case->value => $case->value,
            ])->toArray(),
            'is_active' => [
                'true' => 'Active',
                'false' => 'Inactive',
                'all' => 'All',
            ],
        ];
    }

    public function getList(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = WebEditor::query();

        if (isset($filters['search_keyword']) && ! empty($filters['search_keyword'])) {
            $query->where('name', 'like', '%' . $filters['search_keyword'] . '%');
        }

        if (isset($filters['type']) && ! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== 'all') {
            $isActive = $filters['is_active'] === 'true';
            $query->where('is_active', $isActive);
        }

        $query->orderBy('created_at', 'desc')
            ->orderBy('name');

        return $query->paginate($perPage);
    }

    public function getWebEditor(int $id): WebEditor
    {
        return WebEditor::findOrFail($id);
    }

    public function createWebEditor(array $data): WebEditor
    {
        if (isset($data['status'])) {
            $data['is_active'] = $data['status'] === 'active';
            unset($data['status']);
        }

        return WebEditor::create($data);
    }

    public function updateWebEditor(int $id, array $data): WebEditor
    {
        $webEditor = $this->getWebEditor($id);

        if (isset($data['status'])) {
            $data['is_active'] = $data['status'] === 'active';
            unset($data['status']);
        }

        $webEditor->fill($data);
        $webEditor->save();

        return $webEditor->refresh();
    }

    public function deleteWebEditor(int $id): void
    {
        $webEditor = $this->getWebEditor($id);

        if ($webEditor->templates()->exists()) {
            throw new \Exception('Cannot delete web editor assigned to one or more templates.');
        }

        $webEditor->delete();
    }

    public function getTemplatesByWebEditor(int $id, array $filters, int $perPage)
    {
        $webEditor = $this->getWebEditor($id);

        $query = $webEditor->templates();

        if (isset($filters['search_keyword']) && ! empty($filters['search_keyword'])) {
            $query->where('name', 'like', '%' . $filters['search_keyword'] . '%');
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== 'all') {
            $isActive = $filters['is_active'] === 'true';
            $query->where('is_active', $isActive);
        }

        $query->orderBy('created_at', 'desc')->orderBy('name');

        return $query->paginate($perPage);
    }
}