<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\WorkInstructionPdfService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminWorkInstructionController extends Controller
{
    public function __construct(
        protected WorkInstructionPdfService $workInstructionPdfService,
    ) {}

    public function print(int $orderId): JsonResponse
    {
        try {
            $url = $this->workInstructionPdfService->generateForOrder($orderId);

            return response()->json([
                'success' => true,
                'data' => ['pdf_url' => $url],
            ]);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '주문을 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function batchPrint(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'order_ids'   => 'required|array|min:1',
                'order_ids.*' => 'integer|exists:orders,id',
            ]);

            $url = $this->workInstructionPdfService->generateBatch($request->input('order_ids'));

            return response()->json([
                'success' => true,
                'data' => ['pdf_url' => $url],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
