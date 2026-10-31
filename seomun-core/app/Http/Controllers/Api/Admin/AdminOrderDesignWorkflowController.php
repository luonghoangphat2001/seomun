<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Order\AssignOrderItemDesignerRequest;
use App\Http\Requests\Admin\Order\DesignerAssignedDesignOrderListRequest;
use App\Http\Requests\Admin\Order\StoreOrderDesignReviewBatchRequest;
use App\Http\Requests\Admin\Order\StoreOrderItemDesignDraftRequest;
use App\Http\Resources\Admin\AdminDesignerAssignedDesignOrderResource;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderItemDesignWorkflowService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderDesignWorkflowController extends BaseController
{
    public function __construct(
        private readonly OrderItemDesignWorkflowService $workflowService,
        private readonly PaginationService $paginationService,
    ) {}

    /** Design-service orders assigned to the authenticated designer. */
    public function assignedToMe(DesignerAssignedDesignOrderListRequest $request): JsonResponse
    {
        try {
            $orders = $this->workflowService->assignedOrdersForDesigner($request->user(), $request->validated());

            return $this->responsePaginatedSuccess(200, '내게 배정된 디자인 주문을 조회했습니다.', [
                'orders' => AdminDesignerAssignedDesignOrderResource::collection($orders->items()),
            ], $this->paginationService->format($orders));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function show(string $orderNumber): JsonResponse
    {
        try {
            return $this->responseSuccess(200, '디자인 진행 정보를 조회했습니다.', $this->workflowService->detail(
                Order::where('order_number', $orderNumber)->firstOrFail()
            ));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function assign(AssignOrderItemDesignerRequest $request, string $orderNumber): JsonResponse
    {
        $data = $request->validated();

        try {
            $order = Order::where('order_number', $orderNumber)->firstOrFail();
            $this->workflowService->startForPaidOrder($order);
            $eligibleItemIds = $order->itemDesignWorkflows()->pluck('order_item_id')->map(fn ($id) => (int) $id)->all();
            $itemIds = $data['order_item_ids'] ?? $eligibleItemIds;

            if ($itemIds === []) {
                return $this->responseError(422, '배정할 디자인 서비스 주문 항목이 없습니다.');
            }
            if (array_diff($itemIds, $eligibleItemIds) !== []) {
                return $this->responseError(422, '디자인 서비스 대상이 아닌 주문 항목이 포함되어 있습니다.');
            }

            $designer = User::findOrFail($data['designer_user_id']);
            $workflowIds = $this->workflowService->assignDesigner(
                $order,
                $itemIds,
                $designer,
                $request->user(),
            );

            return $this->responseSuccess(200, '디자이너가 배정되었습니다.', [
                'workflow_ids' => $workflowIds,
                // Return a reloaded workflow so FE immediately receives the
                // assigned_designer object instead of retaining stale null state.
                'design_workflow' => $this->workflowService->detail(Order::findOrFail($order->id)),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function uploadDraft(StoreOrderItemDesignDraftRequest $request, string $orderNumber, int $orderItemId): JsonResponse
    {
        $data = $request->validated();

        try {
            $version = $this->workflowService->submitDraft(
                Order::where('order_number', $orderNumber)->firstOrFail(),
                $orderItemId,
                $request->file('file'),
                $data['note'] ?? null,
                $request->user(),
            );

            return $this->responseSuccess(201, '시안이 저장되었습니다. 고객 확인 요청은 전송 API에서 진행됩니다.', [
                'version_id' => $version->id,
                'version' => $version->version,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function saveAndSendReview(StoreOrderDesignReviewBatchRequest $request, string $orderNumber): JsonResponse
    {
        $data = $request->validated();

        try {
            $result = $this->workflowService->createReviewBatch(
                Order::where('order_number', $orderNumber)->firstOrFail(),
                $data['version_ids'],
                $request->user(),
            );

            return $this->responseSuccess(201, '디자인 시안이 저장되고 고객에게 검토 링크가 SMS로 발송되었습니다.', [
                'review_url' => $result['review_url'],
                'expires_at' => $result['batch']->expires_at?->toIso8601String(),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function approve(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $order = $this->workflowService->approveForProduction(
                Order::where('order_number', $orderNumber)->firstOrFail(),
                $request->user(),
            );

            return $this->responseSuccess(200, '디자인 승인이 완료되어 주문이 확정되었습니다.', [
                'order_number' => $order->order_number,
                'status' => $order->status,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
