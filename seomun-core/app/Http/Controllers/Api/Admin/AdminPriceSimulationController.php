<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Services\Admin\AdminPriceSimulationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPriceSimulationController extends BaseController
{
    public function __construct(
        protected AdminPriceSimulationService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'selected_options' => ['required', 'array'],
            'selected_options.*.group_id' => ['required_with:selected_options', 'integer', 'exists:product_option_groups,id'],
            'selected_options.*.option_id' => ['required_with:selected_options', 'integer', 'exists:product_options,id'],
            'input_options' => ['nullable', 'array'],
            'quantity_sets.quantity' => ['required', 'integer', 'min:1'],
            'quantity_sets.multiplier' => ['required', 'integer', 'min:1'],
        ]);

        try {
            $result = $this->service->simulate($validated);

            return response()->json([
                'success' => true,
                'message' => '단가 시뮬레이션 조회 성공',
                'data'    => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
