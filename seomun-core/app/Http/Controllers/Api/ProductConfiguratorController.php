<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Services\ProductConfiguratorService;
use App\Services\ProductQuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductConfiguratorController extends BaseController
{
    public function __construct(
        protected ProductConfiguratorService $configuratorService,
        protected ProductQuoteService $quoteService,
    ) {}

    public function initialize(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);
        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        }

        $selectedOptions = $request->input('selected_options', []);

        try {
            $data = $this->configuratorService->initialize($id, $selectedOptions);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function resolve(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);
        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        }

        $changedGroupCode = $request->input('changed_group_code');
        $selectedOptions = $request->input('selected_options', []);

        if (! $changedGroupCode) {
            return response()->json([
                'success' => false,
                'message' => 'changed_group_code가 필요합니다.',
            ], 400);
        }

        try {
            $data = $this->configuratorService->resolve($id, $changedGroupCode, $selectedOptions);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function quote(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);
        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        }

        $validated = $request->validate([
            'selected_options' => ['required', 'array'],
            'selected_options.*.group_id' => ['required_with:selected_options', 'integer', 'exists:product_option_groups,id'],
            'selected_options.*.option_id' => ['required_with:selected_options', 'integer', 'exists:product_options,id'],
            'input_options' => ['required', 'array'],
            'quantity_sets.quantity' => ['required', 'integer', 'min:1'],
            'quantity_sets.multiplier' => ['required', 'integer', 'min:1'],
        ]);

        $selectedOptions = $request->input('selected_options', []);
        $quantity = (int) ($request->input('quantity_sets.quantity', 1));
        $case = (int) ($request->input('quantity_sets.multiplier', 1));
        $input_options = $request->input('input_options', []);

        try {
            $data = $this->quoteService->quote($id, $selectedOptions, $input_options, $quantity, $case);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\RuntimeException|\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get quantity list (settlement items) for the matched PRINTING UnitPrice.
     *
     * @return array<int, int>  sorted unique quantity_min values
     */
    public function getquantity(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);
        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        }

        $selectedOptions = $request->input('selected_options', []);

        try {
            $quantities = $this->quoteService->getQuantityTiers($id, $selectedOptions);

            return response()->json([
                'success' => true,
                'data' => $quantities,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
