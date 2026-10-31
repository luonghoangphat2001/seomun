<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FilterMetadataController extends Controller
{
    /**
     * Get filter metadata for products
     * 제품 필터 메타데이터 조회
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $categoryId = $request->input('category_id');

            $metadata = [
                'categories' => $this->getCategories(),
                'price_ranges' => $this->getPriceRanges($categoryId),
                'sort_options' => $this->getSortOptions(),
            ];

            return response()->json([
                'success' => true,
                'data' => $metadata,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '필터 메타데이터를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get categories for filtering
     * 카테고리 목록 조회
     */
    private function getCategories(): array
    {
        $categories = Category::active()
            ->orderBy('sort_order')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'name_en' => $category->name_en,
                    'slug' => $category->slug,
                    'parent_id' => $category->parent_id,
                ];
            })
            ->toArray();

        return $this->buildCategoryTree($categories);
    }

    /**
     * Build hierarchical category tree
     * 계층형 카테고리 트리 구성
     */
    private function buildCategoryTree(array $categories, ?int $parentId = null): array
    {
        $tree = [];

        foreach ($categories as $category) {
            if ($category['parent_id'] == $parentId) {
                $children = $this->buildCategoryTree($categories, $category['id']);
                if (! empty($children)) {
                    $category['children'] = $children;
                }
                $tree[] = $category;
            }
        }

        return $tree;
    }

    /**
     * Get price ranges for filtering
     * 가격 범위 조회
     */
    private function getPriceRanges(?int $categoryId = null): array
    {
        $query = Product::active();

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        $minPrice = (float) $query->min('price');
        $maxPrice = (float) $query->max('price');

        if ($minPrice == 0 && $maxPrice == 0) {
            return [];
        }

        // Generate price ranges
        $ranges = [];
        $step = ($maxPrice - $minPrice) / 5; // 5 ranges

        if ($step > 0) {
            for ($i = 0; $i < 5; $i++) {
                $from = round($minPrice + ($step * $i));
                $to = $i < 4 ? round($minPrice + ($step * ($i + 1))) : $maxPrice;

                $ranges[] = [
                    'label' => number_format($from).'원 ~ '.number_format($to).'원',
                    'from' => $from,
                    'to' => $to,
                ];
            }
        } else {
            // Single price point
            $ranges[] = [
                'label' => number_format($minPrice).'원',
                'from' => $minPrice,
                'to' => $maxPrice,
            ];
        }

        return $ranges;
    }

    /**
     * Get sort options
     * 정렬 옵션 조회
     */
    private function getSortOptions(): array
    {
        return [
            [
                'value' => 'latest',
                'label' => '최신순',
                'label_en' => 'Latest',
            ],
            [
                'value' => 'price_asc',
                'label' => '가격 낮은순',
                'label_en' => 'Price: Low to High',
            ],
            [
                'value' => 'price_desc',
                'label' => '가격 높은순',
                'label_en' => 'Price: High to Low',
            ],
            [
                'value' => 'name_asc',
                'label' => '이름순',
                'label_en' => 'Name: A to Z',
            ],
            [
                'value' => 'popular',
                'label' => '인기순',
                'label_en' => 'Popular',
            ],
            [
                'value' => 'view_count',
                'label' => '조회수순',
                'label_en' => 'Most Viewed',
            ],
        ];
    }
}
