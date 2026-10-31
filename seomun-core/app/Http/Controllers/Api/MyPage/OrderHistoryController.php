<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\MyPage\MyPageOrderHistoryExport;
use App\Http\Requests\MyPage\ChangeOrderShippingAddressRequest;
use App\Http\Requests\MyPage\ConfirmOrderProofRequest;
use App\Http\Requests\MyPage\OrderHistoryListRequest;
use App\Http\Requests\MyPage\OrderShippingAddressPickerRequest;
use App\Http\Requests\MyPage\StoreOrderProofResubmissionRequest;
use App\Http\Requests\MyPage\StoreOrderProofRevisionRequest;
use App\Http\Resources\AdminExportHistory;
use App\Http\Resources\MyPageOrderDeliveryTrackingDetailResource;
use App\Http\Resources\MyPageOrderDeliveryTrackingListResource;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\MyPage\MyPageOrderService;
use App\Services\MyPage\MyPageShippingAddressService;
use App\Services\OrderQuotationPdfService;
use App\Services\OrderService;
use App\Services\OrderTransactionStatementPdfService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OrderHistoryController extends BaseController
{
    public function __construct(
        protected MyPageOrderService $myPageOrderService,
        protected OrderService $orderService,
        protected MyPageShippingAddressService $shippingAddressService,
        protected PaginationService $paginationService,
        protected OrderQuotationPdfService $orderQuotationPdfService,
        protected OrderTransactionStatementPdfService $orderTransactionStatementPdfService,
        protected AdminExportHistoryService $exportHistoryService
    ) {}

    /**
     * Get order history list with filters
     */
    public function index(OrderHistoryListRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $filters = $request->validated();

            $orders = $this->myPageOrderService->getOrders($user, $filters);

            return $this->responsePaginatedSuccess(200, 'Success', [
                'orders' => MyPageOrderDeliveryTrackingListResource::collection($orders->items()),
            ], $this->paginationService->format($orders));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get detail for one row/item from order delivery tracking table.
     */
    public function show(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $order = $this->myPageOrderService->getOrderDetail($request->user(), $orderNumber);

            return response()->json([
                'success' => true,
                'data' => new MyPageOrderDeliveryTrackingDetailResource($order),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function downloadQuotationPdf(Request $request, string $orderNumber): Response|JsonResponse
    {
        try {
            $order = $this->orderQuotationPdfService->getOrder($request->user(), $orderNumber);
            $pdfContent = $this->orderQuotationPdfService->render($order);
            $filename = 'quotation-'.$this->sanitizeFilename($order->order_number).'.pdf';

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Content-Length' => (string) strlen($pdfContent),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Address book list for "배송지 변경" modal (search + pagination + current selection).
     * GET /api/mypage-order-delivery-tracking/histories/{orderNumber}/shipping-addresses
     *
     * FE flow (design): open list → optional "새 주소 추가" uses POST /api/mypage/shipping-addresses
     * (same fields as StoreAddressBookRequest), then reload this list (newest rows first).
     * Confirm selection with PUT .../shipping-address (updates 배송정보 + writes history).
     * "변경 이력 확인" uses GET .../shipping-address-changes (versions newest first).
     */
    public function shippingAddressPicker(OrderShippingAddressPickerRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();
            $order = $this->myPageOrderService->getOrderDetail($user, $orderNumber);
            $validated = $request->validated();
            $perPage = (int) ($validated['per_page'] ?? 15);

            $result = $this->shippingAddressService->getAddressesForOrderPicker(
                $user,
                $order,
                $validated['search'] ?? null,
                $perPage
            );

            return $this->responsePaginatedSuccess(200, 'Success', [
                'selected_address_book_id' => $result['selected_address_book_id'],
                'addresses' => $result['addresses'],
            ], $result['pagination']);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Apply selected address book to order shipping (unpaid orders only).
     * PUT /api/mypage-order-delivery-tracking/histories/{orderNumber}/shipping-address
     */
    public function updateShippingAddress(ChangeOrderShippingAddressRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $validated = $request->validated();
            $order = $this->orderService->updateShippingFromAddressBook(
                $orderNumber,
                $request->user(),
                (int) $validated['address_book_id']
            );

            return response()->json([
                'success' => true,
                'message' => '배송지가 변경되었습니다.',
                'data' => new MyPageOrderDeliveryTrackingDetailResource($order),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Snapshots for "변경 이력 확인" modal (newest revision first).
     * GET /api/mypage-order-delivery-tracking/histories/{orderNumber}/shipping-address-changes
     */
    public function shippingAddressChangeHistory(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $versions = $this->orderService->getShippingAddressHistoryVersions($orderNumber, $request->user());

            return response()->json([
                'success' => true,
                'data' => [
                    'order_number' => $orderNumber,
                    'versions' => $versions,
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Submit "수정 요청하기" from correction modal.
     * POST /api/mypage-order-delivery-tracking/histories/{orderNumber}/proof/revision-request
     */
    public function requestProofRevision(StoreOrderProofRevisionRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $validated = $request->validated();
            $order = $this->orderService->requestProofRevision(
                $orderNumber,
                $request->user(),
                (string) $validated['request_message'],
                (int) $validated['order_item_id'],
                $request->file('attachment'),
            );

            return response()->json([
                'success' => true,
                'message' => '수정 요청이 접수되었습니다.',
                'data' => new MyPageOrderDeliveryTrackingDetailResource($order),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Submit "파일 재접수" from correction modal.
     * POST /api/mypage-order-delivery-tracking/histories/{orderNumber}/proof/resubmit-file
     */
    public function resubmitProofFile(StoreOrderProofResubmissionRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $validated = $request->validated();
            $order = $this->orderService->resubmitProofFile(
                $orderNumber,
                $request->user(),
                $request->file('file'),
                (int) $validated['order_item_id'],
                $validated['note'] ?? null,
            );

            return response()->json([
                'success' => true,
                'message' => '파일 재접수가 완료되었습니다.',
                'data' => new MyPageOrderDeliveryTrackingDetailResource($order),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Confirm proof ("교정 확인").
     * POST /api/mypage-order-delivery-tracking/histories/{orderNumber}/proof/confirm
     */
    public function confirmProof(ConfirmOrderProofRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $validated = $request->validated();
            $order = $this->orderService->confirmProof(
                $orderNumber,
                $request->user(),
                (bool) $validated['confirm'],
                (int) $validated['order_item_id']
            );

            return response()->json([
                'success' => true,
                'message' => '교정 확인이 완료되었습니다.',
                'data' => new MyPageOrderDeliveryTrackingDetailResource($order),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function downloadTransactionStatementPdf(Request $request, string $orderNumber): Response|JsonResponse
    {
        try {
            $order = $this->orderTransactionStatementPdfService->getOrder($request->user(), $orderNumber);
            $pdfContent = $this->orderTransactionStatementPdfService->render($order);
            $filename = 'transaction-statement-'.$this->sanitizeFilename($order->order_number).'.pdf';

            return response($pdfContent, 200, [
                'Content-Type'        => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Content-Length'      => (string) strlen($pdfContent),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Export order history list to Excel
     */
    public function exportExcel(Request $request): JsonResponse
    {
        $request->validate([
            'product_scope' => 'nullable|string|max:50',
            'filter_label' => 'nullable|string|in:all,exclude_cancelled,file_error',
            'status' => 'nullable|string',
            'period' => 'nullable|string|in:1w,1m,3m,6m',
            'order_number_keyword' => 'nullable|string|max:100',
            'product_name_keyword' => 'nullable|string|max:255',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:created_at,order_number',
            'sort_order' => 'nullable|string|in:asc,desc',
        ]);

        try {
            $filters = array_merge(
                $request->only([
                    'product_scope', 'filter_label', 'status', 'period',
                    'order_number_keyword', 'product_name_keyword',
                    'date_from', 'date_to', 'page', 'per_page',
                    'sort_by', 'sort_order',
                ]),
                ['user_id' => $request->user()->id]
            );

            $history = $this->exportHistoryService->executeExcel(
                MyPageOrderHistoryExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'order_history'
            );

            return $this->responseSuccess(200, '내보내기 요청이 접수되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError(500, '내보내기에 실패하였습니다.', [$e->getMessage()]);
        }
    }

    public function checkProgressStatus(int $historyId): JsonResponse
    {
        try {
            $history = $this->exportHistoryService->getHistory($historyId);

            return $this->responseSuccess(200, '내보내기 진행 상태가 성공적으로 조회되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError(500, '진행 상태 조회에 실패하였습니다.', [$e->getMessage()]);
        }
    }

    public function download(ExportHistory $historyId)
    {
        $history = $historyId;

        if ($history->status !== ExcelHistoryStatus::COMPLETED) {
            return $this->responseError(400, '내보내기가 아직 완료되지 않았습니다.');
        }

        $disk = \Illuminate\Support\Facades\Storage::disk('public');
        if (! $disk->exists($history->file_path)) {
            $disk = \Illuminate\Support\Facades\Storage::disk('local');
            if (! $disk->exists($history->file_path)) {
                return $this->responseError(404, '내보내기 파일을 찾을 수 없습니다.');
            }
        }

        return $disk->download($history->file_path, $history->file_name, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$history->file_name.'"',
        ]);
    }

    private function sanitizeFilename(string $value): string
    {
        $sanitized = preg_replace('/[^a-zA-Z0-9\-_.]/', '-', $value) ?: 'quotation';

        return trim($sanitized, '-_.') ?: 'quotation';
    }
}
