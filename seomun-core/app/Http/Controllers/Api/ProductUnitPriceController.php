<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Resources\UnitPriceResource;

class ProductUnitPriceController extends BaseController
{
    public function __construct() {}

    public function index(Request $request, string $slug): JsonResponse
    {
        try {
            $product = Product::query()->where('slug', $slug)->first();

            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => '제품을 찾을 수 없습니다.',
                ], 404);
            }

            $unitPrices = $product->unitPrices()
                ->where('is_active', true)
                ->with(['erpSizeOption', 'erpPaperOption', 'subjectMasterOption', 'items'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => UnitPriceResource::collection($unitPrices),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}