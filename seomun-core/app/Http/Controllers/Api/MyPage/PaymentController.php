<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MyPage\BulkPaymentActionRequest;
use App\Http\Requests\PaymentMypageRequest;
use App\Http\Resources\PaymentResource;
use App\Services\MyPage\MyPagePaymentService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends BaseController
{
    public function __construct(
        protected MyPagePaymentService $paymentService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get pending/processing payments for the current user
     */
    public function pending(PaymentMypageRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $payments = $this->paymentService->getPendingPayments($user, $validated);
            $responseData = [
                'payments' => PaymentResource::collection($payments->items()),
            ];

            return $this->responsePaginatedSuccess(200, '대기 중인 결제 목록이 성공적으로 조회되었습니다.',
                $responseData, $this->paginationService->format($payments));
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), '대기 중인 결제 목록을 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * Get completed payments for the current user
     */
    public function completed(PaymentMypageRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $payments = $this->paymentService->getCompletedPayments($user, $validated);
            $responseData = [
                'payments' => PaymentResource::collection($payments->items()),
            ];

            return $this->responsePaginatedSuccess(200, '완료된 결제 목록이 성공적으로 조회되었습니다.',
                $responseData, $this->paginationService->format($payments));
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), '완료된 결제 목록을 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * Get failed/cancelled payments for the current user
     */
    public function failed(PaymentMypageRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $payments = $this->paymentService->getFailedPayments($user, $validated);
            $responseData = [
                'payments' => PaymentResource::collection($payments->items()),
            ];

            return $this->responsePaginatedSuccess(200, '실패/취소된 결제 목록이 성공적으로 조회되었습니다.',
                $responseData, $this->paginationService->format($payments));
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), '실패/취소된 결제 목록을 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * Get all payments for the current user
     */
    public function index(PaymentMypageRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $payments = $this->paymentService->getAllPayments($user, $validated);
            $responseData = [
                'payments' => PaymentResource::collection($payments->items()),
            ];

            return $this->responsePaginatedSuccess(200, '결제 목록이 성공적으로 조회되었습니다.',
                $responseData, $this->paginationService->format($payments));
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), '결제 목록을 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * Get payment detail for the current user
     */
    public function show(Request $request, string $transactionId): JsonResponse
    {
        try {
            $user = $request->user();

            $payment = $this->paymentService->getPaymentDetail($user, $transactionId);

            if (! $payment) {
                return $this->responseError(404, '결제 내역을 찾을 수 없습니다.');
            }

            $responseData = [
                'payment' => new PaymentResource($payment),
            ];

            return $this->responseSuccess(200, '결제 상세 정보가 성공적으로 조회되었습니다.', $responseData);
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), '결제 상세 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * Get payment progress list for a specific order.
     */
    public function orderProgress(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();
            $progress = $this->paymentService->getOrderPaymentProgress($user, $orderNumber);

            if (empty($progress)) {
                return $this->responseError(404, '해당 주문의 결제 진행 정보를 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '결제 진행 정보가 성공적으로 조회되었습니다.', [
                'order_number' => $orderNumber,
                'payments' => $progress,
            ]);
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), '결제 진행 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * Bulk approve payments
     */
    public function bulkApprove(BulkPaymentActionRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $count = $this->paymentService->bulkApprovePayments(
                $user,
                $validated['transaction_ids']
            );

            return $this->responseSuccess(200, "{$count}건의 결제가 성공적으로 승인되었습니다.", [
                'approved_count' => $count,
            ]);
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), '결제 승인 중 오류가 발생했습니다.');
        }
    }

    /**
     * Bulk reject payments
     */
    public function bulkReject(BulkPaymentActionRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $count = $this->paymentService->bulkRejectPayments(
                $user,
                $validated['transaction_ids'],
                $validated['reason'] ?? null
            );

            return $this->responseSuccess(200, "{$count}건의 결제가 성공적으로 반려되었습니다.", [
                'rejected_count' => $count,
            ]);
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), '결제 반려 중 오류가 발생했습니다.');
        }
    }
}
