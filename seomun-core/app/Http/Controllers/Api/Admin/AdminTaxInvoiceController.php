<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminTaxInvoiceExport;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminTaxInvoiceService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminTaxInvoiceController extends BaseController
{
    public function __construct(
        protected AdminTaxInvoiceService $service,
        protected PaginationService $paginationService,
        protected AdminExportHistoryService $exportHistoryService,
    ) {}

    public function searchFilters(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'filters' => [
                    'issue_statuses' => [
                        ['value' => 'pending', 'label' => 'Pending Issuance'],
                        ['value' => 'issued',  'label' => 'Issued'],
                        ['value' => 'deleted', 'label' => 'Deleted'],
                    ],
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'notes'    => 'nullable|string|max:500',
        ]);

        try {
            $transaction = $this->service->create($request->only(['order_id', 'notes']));

            return response()->json([
                'success' => true,
                'message' => '세금계산서 데이터 생성 완료',
                'data'    => ['transaction' => $transaction],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'date_from'    => 'nullable|date',
            'date_to'      => 'nullable|date',
            'issue_status' => 'nullable|string|in:pending,issued,deleted',
            'order_number' => 'nullable|string|max:100',
            'order_code'   => 'nullable|string|max:100',
            'per_page'     => 'nullable|integer|min:1|max:100',
            'page'         => 'nullable|integer|min:1',
        ]);

        try {
            $paginator = $this->service->getList(
                $request->only(['date_from', 'date_to', 'issue_status', 'order_number', 'order_code']),
                (int) $request->input('per_page', 20)
            );

            return $this->responsePaginatedSuccess(200, '세금계산서 목록이 성공적으로 조회되었습니다.', [
                'items' => $paginator->items(),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function exportExcel(Request $request): JsonResponse
    {
        $request->validate([
            'date_from'    => 'nullable|date',
            'date_to'      => 'nullable|date',
            'issue_status' => 'nullable|string|in:pending,issued,deleted',
            'order_number' => 'nullable|string|max:100',
            'order_code'   => 'nullable|string|max:100',
        ]);

        try {
            $filters = $request->only(['date_from', 'date_to', 'issue_status', 'order_number', 'order_code']);
            $history = $this->exportHistoryService->executeExcel(
                AdminTaxInvoiceExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'tax_invoices'
            );

            return $this->responseSuccess(200, '내보내기 요청이 접수되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError(500, '세금계산서 내보내기에 실패하였습니다.', [$e->getMessage()]);
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

        $disk = Storage::disk('public');
        if (! $disk->exists($history->file_path)) {
            $disk = Storage::disk('local');
            if (! $disk->exists($history->file_path)) {
                return $this->responseError(404, '내보내기 파일을 찾을 수 없습니다.');
            }
        }

        return $disk->download($history->file_path, $history->file_name, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$history->file_name.'"',
        ]);
    }

    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $request->validate([
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'required|integer',
            'status' => 'required|string|in:pending,issued,deleted',
        ]);

        try {
            $updated = $this->service->bulkUpdateStatus($request->input('ids'), $request->input('status'));

            return $this->responseSuccess(200, '세금계산서 상태가 일괄 변경되었습니다.', ['updated_count' => $updated]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], $this->resolveStatusCode($e));
        }
    }

    public function bulkGenerate(Request $request): JsonResponse
    {
        $request->validate([
            'order_ids'   => 'required|array|min:1',
            'order_ids.*' => 'required|integer|exists:orders,id',
            'notes'       => 'nullable|string|max:500',
        ]);

        try {
            $results = $this->service->bulkGenerate($request->input('order_ids'), $request->input('notes'));

            return $this->responseSuccess(201, '세금계산서 일괄 생성이 완료되었습니다.', [
                'created_count' => count($results['created']),
                'skipped_count' => count($results['skipped']),
                'created'       => $results['created'],
                'skipped'       => $results['skipped'],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], $this->resolveStatusCode($e));
        }
    }

    public function issue(int $id): JsonResponse
    {
        try {
            $transaction = $this->service->issue($id);

            return response()->json([
                'success' => true,
                'message' => '세금계산서 발행 완료',
                'data'    => ['transaction' => $transaction],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function setPending(int $id): JsonResponse
    {
        try {
            $transaction = $this->service->setPending($id);

            return response()->json([
                'success' => true,
                'message' => '세금계산서 발행 대기 처리 완료',
                'data'    => ['transaction' => $transaction],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->delete($id);

            return response()->json([
                'success' => true,
                'message' => '세금계산서 삭제 완료',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
