<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentLineConfig\UpsertPaymentLineConfigRequest;
use App\Services\PaymentLineConfigService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentLineConfigController extends Controller
{
    public function __construct(
        protected PaymentLineConfigService $paymentLineConfigService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $data = $this->paymentLineConfigService->getPaymentLineConfig($user);

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get PaymentLineConfig failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '결제 라인 설정을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update or insert a newly created resource in storage.
     */
    public function upsert(UpsertPaymentLineConfigRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $paymentLineConfig = $this->paymentLineConfigService->upsertPaymentLineConfig($user, $validated);

            return response()->json([
                'success' => true,
                'message' => '결제 라인 설정이 성공적으로 저장되었습니다.',
                'data' => $paymentLineConfig,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Upsert PaymentLineConfig failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '결제 라인 설정 저장 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
