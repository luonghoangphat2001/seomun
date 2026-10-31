<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Exports\Admin\AdminOrderExport;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Order\AdminOrderAdjustShippingFeeRequest;
use App\Http\Requests\Admin\Order\AdminOrderBasicInformationUpdateRequest;
use App\Http\Requests\Admin\Order\AdminOrderBulkChangeStatusRequest;
use App\Http\Requests\Admin\Order\AdminOrderBulkDesignPdfRequest;
use App\Http\Requests\Admin\Order\AdminOrderExportRequest;
use App\Http\Requests\Admin\Order\AdminOrderInternalStoreRequest;
use App\Http\Requests\Admin\Order\AdminOrderListRequest;
use App\Http\Requests\Admin\Order\AdminOrderPrintDesignRequest;
use App\Http\Requests\Admin\Order\AdminOrderUpdateStatusRequest;
use App\Http\Requests\Admin\Order\AdminOrderStatusChangeHistoryListRequest;
use App\Http\Resources\Admin\AdminOrderItemResource;
use App\Http\Resources\Admin\AdminOrderModificationLogResource;
use App\Http\Resources\Admin\AdminOrderResource;
use App\Http\Resources\Admin\AdminOrderStatusHistoryResource;
use App\Http\Resources\Admin\AdminOrderStatusChangeHistoryResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Models\Order;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminOrderLogService;
use App\Services\Admin\AdminOrderService;
use App\Services\Admin\OrderDesignPdfService;
use App\Services\PaginationService;
use App\Services\PointTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class AdminOrderController extends BaseController
{
    public function __construct(
        protected AdminOrderService $adminOrderService,
        protected OrderDesignPdfService $orderDesignPdfService,
        protected PaginationService $paginationService,
        protected AdminOrderLogService $adminOrderLogService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PointTransactionService $pointTransactionService
    ) {}

    /**
     * Get order list for admin with filters
     * 주문 목록 조회 (관리자)
     */
    public function index(AdminOrderListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);
            $filters['tax_invoice_status_is_null'] = $request->boolean('tax_invoice_status_is_null');
            $filters['cash_receipt_status_is_null'] = $request->boolean('cash_receipt_status_is_null');
            $orders = $this->adminOrderService->getOrdersForAdmin($filters, $perPage);

            // Calculate grouped and individual order counts
            $groupedCount = $this->adminOrderService->getGroupedOrderCount($filters);
            $individualCount = $orders->total();

            // Get options for dropdowns
            $orderStatuses = array_map(function (OrderStatus $status) {
                return [
                    'value' => $status->value,
                    'label' => $status->label(),
                    'label_en' => $status->labelEn(),
                ];
            }, OrderStatus::cases());

            $paymentMethods = array_map(function (PaymentMethod $method) {
                return [
                    'value' => $method->value,
                    'label' => $method->label(),
                ];
            }, PaymentMethod::allowedForDisplay());

            $paymentStatuses = array_map(function (PaymentStatus $status) {
                return [
                    'value' => $status->value,
                    'label' => $status->label(),
                ];
            }, PaymentStatus::cases());

            return $this->responsePaginatedSuccess(200, '주문 목록이 성공적으로 조회되었습니다.', [
                'orders' => AdminOrderResource::collection($orders->items()),
                'summary' => [
                    'grouped_count' => $groupedCount,
                    'individual_count' => $individualCount,
                ],
                'options' => [
                    'order_statuses' => $orderStatuses,
                    'payment_methods' => $paymentMethods,
                    'payment_statuses' => $paymentStatuses,
                ],
            ], $this->paginationService->format($orders));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Create internal order (for sales representatives).
     * FSD: POST /api/admin/orders/internal
     */
    public function storeInternal(AdminOrderInternalStoreRequest $request): JsonResponse
    {
        $data = $request->validated();

        try {
            $order = $this->adminOrderService->createInternalOrder($data, $request->user());

            return $this->responseSuccess(201, '내부 주문이 성공적으로 생성되었습니다.', [
                'order' => new AdminOrderResource($order),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get order detail for admin
     * 주문 상세 조회 (관리자)
     */
    public function show(string $orderNumber): JsonResponse
    {
        try {
            // Admin can view any order, including deleted ones if needed
            $includeDeleted = request()->boolean('include_deleted', false);

            $order = $this->adminOrderService->getOrderForAdmin($orderNumber, $includeDeleted);

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => new AdminOrderResource($order),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get design assets for an order (for PDF export flow).
     * Returns preview and layout URLs per item so client can generate PDF.
     * FSD: Order Details - design data for printing/export.
     */
    public function designAssets(string $orderNumber): JsonResponse
    {
        try {
            $includeDeleted = request()->boolean('include_deleted', false);
            $order = $this->adminOrderService->getOrderForAdmin($orderNumber, $includeDeleted);

            return response()->json([
                'success' => true,
                'data' => [
                    'order_number' => $order->order_number,
                    'product_information' => [
                        'items' => AdminOrderItemResource::collection($order->items),
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get order design as PDF (front + back). For order list button: view design as PDF.
     * Returns PDF with inline disposition so browser can display it.
     */
    public function designPdf(string $orderNumber): Response
    {
        try {
            $order = $this->adminOrderService->getOrderForAdmin($orderNumber, false);

            $pdfContent = $this->orderDesignPdfService->buildPdf($order);
            $filename = 'design-'.preg_replace('/[^a-zA-Z0-9\-]/', '-', $orderNumber).'.pdf';

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="'.$filename.'"',
                'Content-Length' => (string) strlen($pdfContent),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Bulk download order design PDF (merged PDF or ZIP archive).
     * 일괄 주문 디자인 PDF 다운로드 (단일 통합 PDF 또는 ZIP)
     */
    public function bulkDesignPdf(AdminOrderBulkDesignPdfRequest $request): Response|JsonResponse
    {
        try {
            $orderNumbers = $request->validated('order_numbers');
            $format = strtolower((string) $request->input('format', 'pdf'));

            $orders = Order::whereIn('order_number', $orderNumbers)->get();

            if ($orders->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => '선택한 주문을 찾을 수 없습니다.',
                ], 404);
            }

            if ($format === 'zip') {
                $content = $this->orderDesignPdfService->buildBulkZip($orders);
                $filename = 'orders-designs-'.now()->format('YmdHis').'.zip';

                return response($content, 200, [
                    'Content-Type' => 'application/zip',
                    'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                    'Content-Length' => (string) strlen($content),
                ]);
            }

            $content = $this->orderDesignPdfService->buildBulkPdf($orders);
            $filename = 'orders-designs-'.now()->format('YmdHis').'.pdf';

            return response($content, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Content-Length' => (string) strlen($content),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Download print-ready design PDF (1:1 actual working size, no A4 borders).
     * 인쇄용 디자인 PDF 다운로드 (실제 작업 사이즈 1:1).
     * GET /api/v1/admin/orders/{orderNumber}/print-design
     */
    public function printDesign(AdminOrderPrintDesignRequest $request, string $orderNumber): Response|JsonResponse
    {
        try {
            $validated = $request->validated();
            $orderItemId = isset($validated['order_item_id']) ? (int) $validated['order_item_id'] : null;

            $order = $this->adminOrderService->getOrderForAdmin($orderNumber, false);
            $result = $this->orderDesignPdfService->buildPrintDesign($order, 'pdf', $orderItemId);

            return response($result['content'], 200, [
                'Content-Type' => $result['mime'],
                'Content-Disposition' => 'attachment; filename="'.$result['filename'].'"',
                'Content-Length' => (string) strlen($result['content']),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Bulk download print-ready design PDFs packed into a ZIP archive.
     * 인쇄용 디자인 일괄 ZIP 다운로드
     * POST /api/v1/admin/orders/bulk-print-designs
     */
    public function bulkPrintDesigns(AdminOrderBulkDesignPdfRequest $request): Response|JsonResponse
    {
        try {
            $validated = $request->validated();

            $format = $validated['format'] ?? 'pdf';
            $orders = Order::whereIn('order_number', $validated['order_numbers'])->get();

            if ($orders->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => '선택한 주문을 찾을 수 없습니다.',
                ], 404);
            }

            $zipContent = $this->orderDesignPdfService->buildBulkPrintZip($orders, $format);
            $filename = 'orders-print-designs-'.now()->format('YmdHis').'.zip';

            $storagePath = 'exports/'.$filename;
            Storage::disk('public')->put($storagePath, $zipContent);

            return $this->responseSuccess(200, '인쇄용 디자인 압축 파일이 생성되었습니다.', [
                'zip_file_name' => $filename,
                'download_url' => Storage::disk('public')->url($storagePath),
                'total_orders' => $orders->count(),
                'successful_count' => $orders->count(),
                'failed_orders' => [],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Update order status for admin
     * 주문 상태 업데이트 (관리자). PUT /api/admin/orders/{orderNumber}/status
     */
    public function updateStatus(AdminOrderUpdateStatusRequest $request, string $orderNumber): JsonResponse
    {
        $data = $request->validated();
        try {
            $order = Order::where('order_number', $orderNumber)->first();

            if (! $order) {
                return $this->responseError(404, '주문을 찾을 수 없습니다.');
            }

            if($order->status == OrderStatus::Completed){
                return $this->responseError(400, '이미 완료된 주문은 상태를 변경할 수 없습니다.');
            }

            if (
                ($data['status'] ?? null) === OrderStatus::Confirmed->value
                && $order->itemDesignWorkflows()->exists()
            ) {
                return $this->responseError(
                    422,
                    '디자인 서비스 주문은 디자인 워크플로우 승인 API로 확정해야 합니다.'
                );
            }

            if ($order->fill($data)->isDirty('status')) {
                $oldStatus = $order->getOriginal('status');
                $newStatus = $order->status;
                
                // add point if order completed
                if ($order->status == OrderStatus::Completed) {
                    $this->pointTransactionService->awardOrderPoints($order, null);
                }
                $order->save();
                
                \App\Models\OrderStatusChangeHistory::create([
                    'order_id' => $order->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'changed_by' => $request->user()->id,
                    'note' => $data['note'] ?? null,
                    'change_at' => now(),
                ]);
            }

            return $this->responseSuccess(200, '주문 상태가 성공적으로 수정되었습니다.', [
                'order' => new AdminOrderResource($order),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update basic information of an order.
     * FSD: PUT /api/admin/orders/{orderNumber}/basic-information
     */
    public function updateBasicInformation(AdminOrderBasicInformationUpdateRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $order = Order::where('order_number', $orderNumber)->first();

            if (! $order) {
                return $this->responseError(404, '주문을 찾을 수 없습니다.');
            }

            $data = $request->validated();

            // Set reason for activity log
            if (! empty($data['reason'] ?? null)) {
                $order->logReason = $data['reason'];
                unset($data['reason']);
            }

            $order->fill($data);

            if ($order->isDirty()) {
                $order->save();
            }

            return $this->responseSuccess(200, '주문 기본 정보가 성공적으로 수정되었습니다.', [
                'order' => new AdminOrderResource($order),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Adjust additional shipping fee for an order.
     * FSD: POST /api/admin/orders/{orderNumber}/adjust-shipping-fee
     */
    public function adjustShippingFee(AdminOrderAdjustShippingFeeRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $order = Order::where('order_number', $orderNumber)->first();
            if (! $order) {
                return $this->responseError(404, '주문을 찾을 수 없습니다.');
            }

            $validated = $request->validated();
            $updatedOrder = $this->adminOrderService->adjustShippingFee(
                $order,
                (int) $validated['additional_shipping_fee'],
                (string) $validated['reason'],
                $request->user()
            );

            return $this->responseSuccess(200, '추가 배송비가 성공적으로 등록/수정되었습니다.', [
                'order' => new AdminOrderResource($updatedOrder),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get modification logs for order basic information.
     * FSD: GET /api/admin/orders/{orderNumber}/modification-logs
     */
    public function modificationLogs(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $perPage = (int) $request->input('per_page', 20);
            $filters = $request->only(['date_from', 'date_to']);

            $paginator = $this->adminOrderLogService->getModificationLogs($orderNumber, $filters, $perPage);

            return $this->responsePaginatedSuccess(200, '주문 수정 로그가 성공적으로 조회되었습니다.', [
                'logs' => AdminOrderModificationLogResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get order status change history
     */
    public function statusChangeHistory(AdminOrderStatusChangeHistoryListRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $perPage = (int) $request->input('per_page', 20);
            $order = Order::where('order_number', $orderNumber)->firstOrFail();
            $histories = \App\Models\OrderStatusChangeHistory::with('changedBy')
                ->where('order_id', $order->id)
                ->latest()
                ->paginate($perPage);

            return $this->responsePaginatedSuccess(200, '주문 상태 변경 이력이 성공적으로 조회되었습니다.', [
                'histories' => AdminOrderStatusChangeHistoryResource::collection($histories->items()),
            ], $this->paginationService->format($histories));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get order status history.
     * FSD: GET /api/admin/orders/{orderNumber}/status-history
     */
    public function statusHistory(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $perPage = (int) $request->input('per_page', 20);
            $filters = $request->only(['date_from', 'date_to']);

            $paginator = $this->adminOrderLogService->getStatusHistory($orderNumber, $filters, $perPage);

            return $this->responsePaginatedSuccess(200, '주문 상태 내역이 성공적으로 조회되었습니다.', [
                'history' => AdminOrderStatusHistoryResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Bulk change order status for admin
     * 주문 상태 일괄 업데이트 (관리자)
     */
    public function bulkChangeStatus(AdminOrderBulkChangeStatusRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $user = $request->user();
            $orders = $this->adminOrderService->bulkUpdateOrdersStatus($data, $user);

            return $this->responseSuccess(200, '주문 상태가 성공적으로 수정되었습니다.', $orders);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update waybill (tracking) number for an order.
     */
    public function updateWaybill(Request $request, string $orderNumber): JsonResponse
    {
        $data = $request->validate([
            'waybill_number' => ['nullable', 'string', 'max:100'],
            'waybill_courier' => ['nullable', 'string', 'max:100'],
        ]);

        try {
            $order = Order::where('order_number', $orderNumber)->first();

            if (! $order) {
                return $this->responseError(404, '주문을 찾을 수 없습니다.');
            }

            $metadata = $order->metadata ?? [];
            $metadata['waybill_number'] = $data['waybill_number'] ?? null;
            $metadata['waybill_courier'] = $data['waybill_courier'] ?? null;
            $metadata['waybill_registered_at'] = now()->toIso8601String();
            $order->metadata = $metadata;
            $order->save();

            return $this->responseSuccess(200, '운송장이 성공적으로 수정되었습니다.', [
                'order' => new AdminOrderResource($order),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Export orders list to Excel. Supports export_type: ALL, CURRENT_PAGE, SELECTED.
     */
    public function exportExcel(AdminOrderExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminOrderExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'orders'
            );

            return $this->responseSuccess(200, '내보내기 요청이 접수되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $th) {
            return $this->responseError(500, '주문 내보내기에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    /**
     * Check export progress status for orders Excel.
     */
    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        return $this->responseSuccess(200, '내보내기 진행 상태가 성공적으로 조회되었습니다.', [
            'history' => new AdminExportHistory($history),
        ]);
    }

    /**
     * Download orders export file.
     */
    public function download(ExportHistory $history)
    {
        if (! $history) {
            return $this->responseError(404, '내보내기 기록을 찾을 수 없습니다.');
        }

        if ($history->status !== ExcelHistoryStatus::COMPLETED) {
            return $this->responseError(400, '내보내기가 아직 완료되지 않았습니다.');
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($history->file_path)) {
            $disk = Storage::disk('local');
            if (! $disk->exists($history->file_path)) {
                return $this->responseError(404, '내보내기 파일을 찾을 수 없습니다.');
            }
        }

        return $disk->download($history->file_path, $history->file_name, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$history->file_name.'"',
        ]);
    }
}
