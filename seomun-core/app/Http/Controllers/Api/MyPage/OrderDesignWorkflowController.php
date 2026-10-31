<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Models\Order;
use App\Services\OrderItemDesignWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderDesignWorkflowController extends BaseController
{
    public function __construct(private readonly OrderItemDesignWorkflowService $workflowService) {}

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $order = Order::where('order_number', $orderNumber)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            return $this->responseSuccess(200, '디자인 진행 정보를 조회했습니다.', $this->workflowService->detail($order));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function respond(Request $request, string $orderNumber, int $orderItemId): JsonResponse
    {
        $data = $request->validate([
            'version_id' => ['required', 'integer'],
            'response' => ['required', 'in:approved,rejected'],
            'note' => ['nullable', 'string', 'max:5000'],
        ]);

        if ($data['response'] === 'rejected' && blank($data['note'] ?? null)) {
            return $this->responseError(422, '디자인 반려 시 수정 요청 내용을 입력해주세요.');
        }

        try {
            $workflow = $this->workflowService->respondToDraft(
                Order::where('order_number', $orderNumber)->firstOrFail(),
                $orderItemId,
                (int) $data['version_id'],
                $data['response'],
                $data['note'] ?? null,
                $request->user(),
            );

            return $this->responseSuccess(200, '디자인 검토 결과가 저장되었습니다.', [
                'workflow_id' => $workflow->id,
                'status' => $workflow->status->value,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
