<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Services\MyPage\MyPageApprovalService;
use App\Services\OrderApprovalService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApprovalController extends BaseController
{
    public function __construct(
        protected MyPageApprovalService $approvalService,
        protected OrderApprovalService $orderApprovalService
    ) {}

    /**
     * Get approval progress for an order
     */
    public function progress(string $orderNumber): JsonResponse
    {
        try {
            $user = Auth::user();
            $progress = $this->approvalService->getApprovalProgress($orderNumber, $user);

            if (! $progress) {
                return $this->responseError(404, '결재 진행 상황을 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', ['progress' => $progress]);
        } catch (\Exception $e) {
            return $this->responseError(500, '결재 진행 상황을 불러오는데 실패했습니다.');
        }
    }

    /**
     * Cancel current stage of an order (결재 취소)
     */
    public function cancel(Request $request, string $orderNumber): JsonResponse
    {
        $validated = $request->validate([
            'cancel_reason' => 'required|string|max:500',
        ]);

        try {
            $this->orderApprovalService->cancel(
                $orderNumber,
                Auth::user(),
                $validated['cancel_reason']
            );

            return $this->responseSuccess(200, '결재 취소 처리가 완료되었습니다.');
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '주문을 찾을 수 없습니다.');
        } catch (\InvalidArgumentException $e) {
            return $this->responseError(422, $e->getMessage());
        } catch (\Exception $e) {
            return $this->responseError(500, '결재 처리 중 오류가 발생했습니다.');
        }
    }
}
