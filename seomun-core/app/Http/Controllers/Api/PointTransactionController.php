<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\PointTransactionIndexRequest;
use App\Http\Resources\PointTransactionResource;
use App\Services\PaginationService;
use App\Services\PointTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PointTransactionController extends BaseController
{
    public function __construct(
        protected PointTransactionService $transactionService,
        protected PaginationService $paginationService
    ) {}

    public function index(PointTransactionIndexRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();
            $perPage = (int) $validated['per_page'];

            $transactions = $this->transactionService->getTransactions($user, $validated, $perPage);

            return response()->json([
                'success' => true,
                'message' => '포인트 내역 조회 성공',
                'data' => [
                    'transactions' => PointTransactionResource::collection($transactions),
                ],
                'pagination' => $this->paginationService->format($transactions),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get point transactions failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '포인트 내역 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    public function summary(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $summary = $this->transactionService->getSummary($user);

            return $this->responseSuccess(200, '포인트 요약 조회 성공', $summary);
        } catch (\Exception $e) {
            Log::error('Get point summary failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '포인트 요약 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }
}
