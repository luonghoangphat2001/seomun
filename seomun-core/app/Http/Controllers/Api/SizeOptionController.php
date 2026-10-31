<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SizeOption;

class SizeOptionController extends Controller
{
    /**
     * Get size options for a specific product ID
     */
    public function getByProductId(int $productId)
    {
        $sizeOptions = SizeOption::query()
            ->whereHas('erpOptions', function ($query) use ($productId) {
                $query->whereHas('productOptions', function ($query) use ($productId) {
                    $query->whereHas('group', function ($query) use ($productId) {
                        $query->whereHas('product', function ($query) use ($productId) {
                            $query->where('product_id', $productId);
                        });
                    });
                });
            })
            ->with([
                'erpOptions.productOptions' => function ($query) use ($productId) {
                    $query->whereHas('group', function ($q) use ($productId) {
                        $q->where('product_id', $productId);
                    });
                }
            ])
            ->get()
            ->map(function ($sizeOption) {

                $productOption = $sizeOption->erpOptions
                    ->flatMap->productOptions
                    ->first();

                return [
                    'id' => $sizeOption->id,
                    'name' => $sizeOption->name,
                    'cutting_width' => $sizeOption->cutting_width,
                    'cutting_height' => $sizeOption->cutting_height,
                    'working_width' => $sizeOption->working_width,
                    'working_height' => $sizeOption->working_height,

                    'option_id' => $productOption?->id,
                    'group_id' => $productOption?->option_group_id,
                ];
            });

        if ($sizeOptions->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => '해당 상품의 사이즈 옵션을 찾을 수 없습니다.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'product_id' => $productId,
                'size_options' => $sizeOptions,
            ],
        ]);
    }
}
