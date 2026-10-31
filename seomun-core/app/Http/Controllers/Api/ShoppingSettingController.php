<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShoppingSettingResource;
use App\Services\Admin\ShoppingSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShoppingSettingController extends Controller
{
    public function __construct(
        protected ShoppingSettingService $shoppingSettingService
    ) {}

    /**
     * Display a listing of shopping settings (Public).
     * Supports `product_slug` (or `product_id`) to get resolved settings for a specific product.
     * Supports optional filter by `type`.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            if ($productSlug = $request->input('product_slug')) {
                return $this->byProductSlug($productSlug, $request);
            }

            $type = $request->input('type');
            $settings = $this->shoppingSettingService->getPublicShoppingSettings($type);

            return response()->json([
                'success' => true,
                'data' => [
                    'shopping_settings' => ShoppingSettingResource::collection($settings),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to retrieve public shopping settings', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '쇼핑 설정을 불러오는 중 오류가 발생했습니다.',
            ], 500);
        }
    }

    /**
     * Display shopping settings for a product by product slug (Public).
     */
    public function byProductSlug(string $slug, Request $request): JsonResponse
    {
        try {
            $product = \App\Models\Product::with('shoppingSettingItems')->where('slug', $slug)->first();

            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => '해당 상품을 찾을 수 없습니다.',
                ], 404);
            }

            $settings = $this->shoppingSettingService->getSettingsForProduct($product);

            if ($request->boolean('only_selected')) {
                $settings = $settings->where('has_selected_item', true)->values();
            }

            if ($type = $request->input('type')) {
                $settings = $settings->where('type', $type)->values();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                    ],
                    'shopping_settings' => $settings,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to retrieve shopping settings by product slug', [
                'slug' => $slug,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '쇼핑 설정을 불러오는 중 오류가 발생했습니다.',
            ], 500);
        }
    }

    /**
     * Display the specified shopping setting by ID (Public).
     */
    public function show(int $id): JsonResponse
    {
        try {
            $setting = $this->shoppingSettingService->getPublicShoppingSettingById($id);

            if (! $setting) {
                return response()->json([
                    'success' => false,
                    'message' => '쇼핑 설정을 찾을 수 없습니다.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'shopping_setting' => new ShoppingSettingResource($setting),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to retrieve public shopping setting', [
                'setting_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '쇼핑 설정을 불러오는 중 오류가 발생했습니다.',
            ], 500);
        }
    }
}
