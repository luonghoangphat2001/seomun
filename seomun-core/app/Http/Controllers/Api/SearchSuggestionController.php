<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchSuggestionController extends Controller
{
    /**
     * Get search suggestions based on keyword
     * 검색어 기반 검색 제안 조회
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $keyword = trim($request->input('q', ''));
            $limit = (int) $request->input('limit', 10);

            if (empty($keyword)) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'suggestions' => $this->getPopularSuggestions($limit),
                    ],
                ]);
            }

            $suggestions = [
                'products' => $this->getProductSuggestions($keyword, min($limit, 5)),
                'categories' => $this->getCategorySuggestions($keyword, min($limit, 3)),
            ];

            // Combine and limit total suggestions
            $allSuggestions = array_merge($suggestions['products'], $suggestions['categories']);
            $allSuggestions = array_slice($allSuggestions, 0, $limit);

            return response()->json([
                'success' => true,
                'data' => [
                    'keyword' => $keyword,
                    'suggestions' => $allSuggestions,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '검색 제안을 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get product suggestions
     * 제품 제안 조회
     */
    private function getProductSuggestions(string $keyword, int $limit): array
    {
        $products = Product::active()
            ->where(function ($query) use ($keyword) {
                $query->where('name', 'like', "%{$keyword}%")
                    ->orWhere('name_en', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%")
                    ->orWhere('short_description', 'like', "%{$keyword}%")
                    ->orWhere('sku', 'like', "%{$keyword}%");
            })
            ->orderBy('view_count', 'desc')
            ->orderBy('is_popular', 'desc')
            ->limit($limit)
            ->get();

        return $products->map(function ($product) {
            return [
                'type' => 'product',
                'id' => $product->id,
                'text' => $product->name,
                'slug' => $product->slug,
                'image' => $product->first_image,
            ];
        })->toArray();
    }

    /**
     * Get category suggestions
     * 카테고리 제안 조회
     */
    private function getCategorySuggestions(string $keyword, int $limit): array
    {
        $categories = Category::active()
            ->where(function ($query) use ($keyword) {
                $query->where('name', 'like', "%{$keyword}%")
                    ->orWhere('name_en', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%");
            })
            ->orderBy('sort_order')
            ->limit($limit)
            ->get();

        return $categories->map(function ($category) {
            return [
                'type' => 'category',
                'id' => $category->id,
                'text' => $category->name,
                'slug' => $category->slug,
                'image' => $category->image,
            ];
        })->toArray();
    }

    /**
     * Get popular suggestions (when no keyword)
     * 인기 제안 조회 (키워드 없을 때)
     */
    private function getPopularSuggestions(int $limit): array
    {
        // Popular products
        $popularProducts = Product::active()
            ->where('is_popular', true)
            ->orderBy('view_count', 'desc')
            ->limit(min($limit, 5))
            ->get();

        $suggestions = $popularProducts->map(function ($product) {
            return [
                'type' => 'product',
                'id' => $product->id,
                'text' => $product->name,
                'slug' => $product->slug,
                'image' => $product->first_image,
            ];
        })->toArray();

        // Popular categories
        $popularCategories = Category::active()
            ->whereHas('products', function ($query) {
                $query->where('is_active', true);
            })
            ->withCount('products')
            ->orderBy('products_count', 'desc')
            ->limit(min($limit - count($suggestions), 3))
            ->get();

        $categorySuggestions = $popularCategories->map(function ($category) {
            return [
                'type' => 'category',
                'id' => $category->id,
                'text' => $category->name,
                'slug' => $category->slug,
                'image' => $category->image,
            ];
        })->toArray();

        return array_merge($suggestions, $categorySuggestions);
    }
}
