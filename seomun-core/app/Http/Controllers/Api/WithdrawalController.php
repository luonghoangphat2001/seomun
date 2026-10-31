<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MyPage\MyPageWithdrawalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class WithdrawalController extends Controller
{
    public function __construct(
        protected MyPageWithdrawalService $withdrawalService
    ) {}

    /**
     * Check if user can withdraw and return current balance summary (탈퇴 가능 여부 + 잔액 확인).
     */
    public function check(Request $request): JsonResponse
    {
        $user = $request->user();
        $hasBlocking = $this->withdrawalService->hasBlockingOrders($user);
        $currentBalance = $this->withdrawalService->getCurrentBalance($user);

        return response()->json([
            'success' => true,
            'data' => [
                'can_withdraw'      => ! $hasBlocking,
                'blocking_reason'   => $hasBlocking ? '진행중인 주문 또는 미납잔액이 있습니다.' : null,
                'current_balance'   => $currentBalance,
            ],
        ]);
    }

    /**
     * Process withdrawal with password confirmation (회원탈퇴 처리).
     */
    public function withdraw(Request $request): JsonResponse
    {
        $request->validate([
            'password'           => 'required|string',
            'reasons'            => 'required|array|min:1',
            'reasons.*'          => 'string|in:상품 종류 부족,상품 가격/품질 불만,교환/반품/AS 서비스 불만,고객응대 불만,이용빈도 낮음,배송 서비스 불만,홈페이지 이용 불만,기타 (직접 입력)',
            'additional_comment' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        if (! Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'success' => false,
                'message' => '비밀번호가 올바르지 않습니다.',
            ], 422);
        }

        try {
            $this->withdrawalService->withdraw(
                $user,
                $request->input('reasons'),
                $request->input('additional_comment'),
            );

            return response()->json([
                'success' => true,
                'message' => '회원탈퇴가 완료되었습니다.',
            ]);
        } catch (\Exception $e) {
            $statusCode = (int) $e->getCode();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], in_array($statusCode, [400, 422]) ? $statusCode : 500);
        }
    }
}
