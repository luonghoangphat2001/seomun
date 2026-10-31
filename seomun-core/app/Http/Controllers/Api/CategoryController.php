<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends BaseController
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    /**
     * Display a listing of categories
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $options = [
                'with_children' => $request->boolean('with_children', false),
                'root_only' => $request->boolean('root_only', true),
                'customer_id' => $request->query('customer_id') ? (int) $request->query('customer_id') : null,
            ];

            $categories = $this->categoryService->getAllCategories($options);

            return response()->json([
                'success' => true,
                'data' => [
                    'categories' => CategoryResource::collection($categories),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '카테고리 목록을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified category
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $category = $this->categoryService->getCategoryDetails($slug);

            return response()->json([
                'success' => true,
                'data' => [
                    'category' => new CategoryResource($category),
                ],
            ], 200);
        } catch (\Exception $e) {
            $statusCode = $e->getCode() === 404 ? 404 : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }

    /**
     * Display products for a category
     */
    public function products(string $slug, Request $request): JsonResponse
    {
        try {
            $filters = [
                'sort_by' => $request->input('sort_by'),
                'sort_order' => $request->input('sort_order'),
            ];
            $perPage = (int) $request->input('per_page', 15);

            $data = $this->categoryService->getCategoryProducts($slug, $filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'category' => new CategoryResource($data['category']),
                    'products' => ProductResource::collection($data['products']),
                ],
                'pagination' => $data['pagination'],
            ], 200);
        } catch (\Exception $e) {
            $statusCode = $e->getCode() === 404 ? 404 : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }
}
