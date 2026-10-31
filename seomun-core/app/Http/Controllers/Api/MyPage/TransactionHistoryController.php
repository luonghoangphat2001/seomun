<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Services\MyPage\MyPageTransactionHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionHistoryController extends BaseController
{
    public function __construct(
        protected MyPageTransactionHistoryService $service,
    ) {}

    /**
     * GET /api/mypage/transaction-history
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'months' => 'nullable|integer|in:1,3,6',
            'search' => 'nullable|string|max:100',
            'start_date' => 'nullable|date|before_or_equal:end_date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        try {
            $result = $this->service->getList(
                $request->user(),
                $request->only(['months', 'search', 'start_date', 'end_date'])
            );

            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', $result);
        } catch (\Throwable $e) {
            return $this->responseError(500, '거래내역을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }
}
