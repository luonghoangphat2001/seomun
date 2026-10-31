<?php

namespace App\Http\Controllers\Api;

use App\Services\PointBalanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PointBalanceController extends BaseController
{
    public function __construct(
        protected PointBalanceService $balanceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $balance = $this->balanceService->getBalance($user);

            return $this->responseSuccess(200, '포인트 잔액 조회 성공', [
                'balance' => $balance,
            ]);
        } catch (\Exception $e) {
            Log::error('Get point balance failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '포인트 잔액 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }
}
