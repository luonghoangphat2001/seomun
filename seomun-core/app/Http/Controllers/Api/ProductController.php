<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserGuideStatus;
use App\Http\Resources\ProductListResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\UserGuidePublicResource;
use App\Models\Product;
use App\Models\UserGuide;
use App\Services\PaginationService;
use App\Services\ProductService;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends BaseController
{
    public function __construct(
        protected ProductService $productService,
        protected ReviewService $reviewService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Display a listing of products with pagination
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = [
                'category_id' => $request->input('category_id'),
                'sort_by' => $request->input('sort_by'),
                'sort_order' => $request->input('sort_order'),
            ];

            $perPage = (int) $request->input('per_page', 15);

            $products = $this->productService->getProductList($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'products' => ProductListResource::collection($products->items()),
            ], $this->paginationService->format($products));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '제품 목록을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 이용안내 (Usage Guide) – active user guides linked to this product.
     * FE: show one "이용안내" tag; on click open first guide's file or modal listing all.
     */
    public function userGuides(string $slug): JsonResponse
    {
        try {
            $product = Product::query()->where('slug', $slug)->first();
            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => '제품을 찾을 수 없습니다.',
                ], 404);
            }

            $guides = UserGuide::query()
                ->where('status', UserGuideStatus::ACTIVE)
                ->whereHas('products', fn ($q) => $q->where('products.id', $product->id))
                ->orderBy('id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'user_guides' => UserGuidePublicResource::collection($guides),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display reviews for a product (제품 리뷰 목록)
     * GET /products/{slug}/reviews
     */
    public function reviews(Request $request, string $slug): JsonResponse
    {
        try {
            $reviews = $this->reviewService->getProductReviews($slug, $request);

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'reviews' => $reviews['reviews'],
            ], $reviews['pagination']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '리뷰 목록을 불러오는 중 오류가 발생했습니다.',
            ], 500);
        }
    }

    /**
     * Display the specified product
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $product = $this->productService->getProductDetails($slug);
            $product->load('productSets', 'pricingProfile', 'webEditor', 'dielineFile', 'shoppingSettingItems.setting');

            return response()->json([
                'success' => true,
                'data' => [
                    'product' => new ProductResource($product),
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
     * Display popular products (인기상품)
     */
    public function popular(Request $request): JsonResponse
    {
        try {
            $limit = (int) $request->input('limit', 10);

            $products = $this->productService->getPopularProducts($limit);

            return response()->json([
                'success' => true,
                'data' => [
                    'products' => ProductListResource::collection($products),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '인기 상품을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search products by keyword
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $keyword = $request->input('q', '');
            $includeChildCategory = $request->boolean('include_child_categories');
            $filters = [
                'category_id' => $request->input('category_id'),
            ];
            $perPage = (int) $request->input('per_page', 15);

            $products = $this->productService->searchProducts($keyword, $filters, $perPage, $includeChildCategory);

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'keyword' => $keyword,
                'products' => ProductListResource::collection($products->items()),
            ], $this->paginationService->format($products));
        } catch (\Exception $e) {
            $statusCode = $e->getCode() === 400 ? 400 : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }
}
