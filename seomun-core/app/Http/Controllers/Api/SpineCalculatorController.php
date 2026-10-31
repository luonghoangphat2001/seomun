<?php

namespace App\Http\Controllers\Api;

use App\Services\Admin\SpineCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SpineCalculatorController extends BaseController
{
    public function __construct(
        protected SpineCalculatorService $service
    ) {}

    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'paper_id' => [
                'required',
                'integer',
                Rule::exists('papers', 'id'),
            ],

            'print_side' => [
                'required',
                'in:single,double',
            ],

            'pages' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $result = $this->service->calculate($validated);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }
}
