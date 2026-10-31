<?php

namespace App\Http\Exports\Admin;

use App\Models\Category;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminCategoryExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    protected array $filters;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->locale = Arr::get($filters, 'locale', 'en');
    }

    public function query()
    {
        $query = Category::query()->with(['parent.parent', 'createdBy']);

        $largeCategoryName = $this->filters['large_category_name'] ?? null;
        $mediumCategoryName = $this->filters['medium_category_name'] ?? null;
        $smallCategoryName = $this->filters['small_category_name'] ?? null;
        $status = $this->filters['status'] ?? null;
        $registrant = $this->filters['registrant'] ?? null;

        if ($largeCategoryName) {
            $query->whereNull('parent_id')
                ->where('name', 'like', '%'.$largeCategoryName.'%');
        }
        if ($mediumCategoryName) {
            $query->whereHas('parent', function ($q) {
                $q->whereNull('parent_id');
            })->where('name', 'like', '%'.$mediumCategoryName.'%');
        }
        if ($smallCategoryName) {
            $query->whereHas('parent', function ($q) {
                $q->whereNotNull('parent_id');
            })->where('name', 'like', '%'.$smallCategoryName.'%');
        }
        if ($status) {
            $query->where('is_active', $status === 'active');
        }
        if ($registrant) {
            $query->whereHas('createdBy', function ($builder) use ($registrant) {
                $builder->where('username', 'like', '%'.$registrant.'%')
                    ->orWhere('name', 'like', '%'.$registrant.'%')
                    ->orWhere('email', 'like', '%'.$registrant.'%');
            });
        }

        $exportType = Arr::get($this->filters, 'export_type', 'ALL');
        switch ($exportType) {
            case 'ALL':
                break;
            case 'CURRENT_PAGE':
                $currentPage = (int) Arr::get($this->filters, 'current_page', 1);
                $perPage = (int) Arr::get($this->filters, 'per_page', 20);
                $query->offset(($currentPage - 1) * $perPage)->limit($perPage);
                break;
            case 'SELECTED':
                $selectedIds = Arr::get($this->filters, 'selected_ids', []);
                if ($selectedIds !== []) {
                    $idsWithChildren = $this->expandSelectedIdsWithChildren($selectedIds);
                    $query->whereIn('categories.id', $idsWithChildren);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        // Order so that each root category row is followed by its children rows.
        // For current 2-level structure (large/medium), COALESCE(parent_id, id) groups
        // root and its children together, then we sort within the group.
        $query
            ->orderByRaw('COALESCE(parent_id, id)')
            ->orderBy('parent_id')
            ->orderBy('sort_order')
            ->orderBy('id');

        return $query;
    }

    /**
     * Expand selected category IDs to include all descendants (children, grandchildren, etc.).
     *
     * @param  array<int>  $selectedIds
     * @return array<int>
     */
    protected function expandSelectedIdsWithChildren(array $selectedIds): array
    {
        $ids = $selectedIds;
        $collected = $ids;

        do {
            $childIds = Category::whereIn('parent_id', $ids)->pluck('id')->all();
            $newIds = array_values(array_diff($childIds, $collected));
            if ($newIds === []) {
                break;
            }
            $collected = array_merge($collected, $newIds);
            $ids = $newIds;
        } while (true);

        return array_values(array_unique($collected));
    }

    public function map($category): array
    {
        // Determine root/child1/child2 based on depth.
        // - Row root: only Root Category = level 1
        // - Consecutive rows: only Child Category (Level 1) or (Level 2),
        //   column Root is empty (when looking vertically, you will see a block of root + children below).
        $root = null;
        $childLevel1 = null;
        $childLevel2 = null;

        if ($category->parent && $category->parent->parent) {
            // depth 3: parent (level 1) + current (level 2)
            // Root is only displayed in the row of level 1 category,
            // so here only fill Child 1 + Child 2.
            $childLevel1 = $category->parent->name;
            $childLevel2 = $category->name;
        } elseif ($category->parent && ! $category->parent->parent) {
            // depth 2: current is child level 1 of a root
            // Root is only displayed in the row of level 1 category,
            // so here only fill Child 1.
            $childLevel1 = $category->name;
        } else {
            // depth 1: root only (row root)
            $root = $category->name;
        }

        $statusLabels = [
            'en' => ['Active', 'Hidden'],
            'ko' => ['노출', '숨김'],
            'ja' => ['表示', '非表示'],
        ];

        $status = $category->is_active
            ? ($statusLabels[$this->locale][0] ?? 'Active')
            : ($statusLabels[$this->locale][1] ?? 'Hidden');

        return [
            $root,
            $childLevel1,
            $childLevel2,
            $category->code,
            $category->slug,
            $category->name_en,
            $category->name_ja,
            $category->description,
            $status,
            $category->createdBy?->username,
            $category->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        $headings = [
            'en' => [
                'Root Category',
                'Child Category (Level 1)',
                'Child Category (Level 2)',
                'Category Code',
                'Slug',
                'Name (EN)',
                'Name (JA)',
                'Description',
                'Status',
                'Registrant',
                'Registered At',
            ],
            'ko' => [
                '루트 카테고리',
                '자식 카테고리 (1단계)',
                '자식 카테고리 (2단계)',
                '카테고리 코드',
                '슬러그',
                '이름 (영문)',
                '이름 (일문)',
                '설명',
                '상태',
                '등록자',
                '등록일시',
            ],
            'ja' => [
                'ルートカテゴリ',
                '子カテゴリ (レベル1)',
                '子カテゴリ (レベル2)',
                'カテゴリコード',
                'スラッグ',
                '名称 (英語)',
                '名称 (日本語)',
                '説明',
                'ステータス',
                '登録者',
                '登録日時',
            ],
        ];

        return $headings[$this->locale] ?? $headings['en'];
    }
}
