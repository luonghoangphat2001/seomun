<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MyPage\MyPageAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyAccountController extends Controller
{
    public function __construct(
        protected MyPageAccountService $accountService
    ) {}

    /**
     * Get current account info (전용계좌 / 환불계좌).
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $account = $this->accountService->getAccount($request->user());

            return response()->json([
                'success' => true,
                'data' => [
                    'account' => $account,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '계좌 정보를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change bank for dedicated account (전용계좌 은행 변경).
     */
    public function updateBank(Request $request): JsonResponse
    {
        $request->validate([
            'bank_code' => 'required|string|max:20',
            'account_number' => 'required|string|max:30',
            'account_holder' => 'required|string|max:50',
        ]);

        try {
            $account = $this->accountService->saveAccount(
                $request->user(),
                $request->only(['bank_code', 'account_number', 'account_holder'])
            );

            return response()->json([
                'success' => true,
                'message' => '계좌가 등록/변경되었습니다.',
                'data' => [
                    'account' => $account,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '계좌 변경 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get refund history list with date filters (환불내역 조회).
     */
    public function histories(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string|in:pending,completed,failed',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        try {
            $filters = $request->only(['start_date', 'end_date', 'status']);
            $perPage = (int) $request->input('per_page', 15);

            $result = $this->accountService->getHistories(
                $request->user(),
                $filters,
                $perPage
            );

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '환불내역을 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download dedicated account issuance certificate (전용계좌 발급확인서).
     */
    public function certificate(Request $request): JsonResponse
    {
        try {
            $certificate = $this->accountService->getCertificate($request->user());

            if (! $certificate) {
                return response()->json([
                    'success' => false,
                    'message' => '등록된 전용계좌가 없습니다.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'certificate' => $certificate,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '발급확인서를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
