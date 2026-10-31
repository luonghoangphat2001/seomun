<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\MyPage\MyPageCashReceiptExport;
use App\Http\Resources\AdminExportHistory;
use App\Http\Resources\MyPageCashReceiptResource;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\MyPage\MyPageReceiptService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CashReceiptController extends BaseController
{
    public function __construct(
        protected MyPageReceiptService $service,
        protected PaginationService $paginationService,
        protected AdminExportHistoryService $exportHistoryService,
    ) {}

    /**
     * GET /api/mypage/cash-receipts
     * 현금영수증 목록 (individual members)
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => ['nullable', 'date', 'before_or_equal:end_date'],
            'end_date'   => ['nullable', 'date', 'after_or_equal:start_date'],
            'months'     => 'nullable|integer|in:6',
            'years'      => 'nullable|integer|in:1,2,3',
            'per_page'   => 'nullable|integer|min:1|max:100',
        ]);

        try {
            $filters = array_merge(
                $request->only(['start_date', 'end_date']),
                $request->only(['months', 'years']),
                ['issue_status' => 'issued']
            );

            $paginator = $this->service->getCashReceiptList(
                $request->user(),
                $filters,
                (int) $request->input('per_page', 15)
            );

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'items' => MyPageCashReceiptResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError(500, '현금영수증 목록을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    public function exportExcel(Request $request): JsonResponse
    {
        Validator::make($request->all(), [
            'start_date' => ['nullable', 'date', 'before_or_equal:end_date'],
            'end_date'   => ['nullable', 'date', 'after_or_equal:start_date'],
            'months'     => 'nullable|integer|in:6',
            'years'      => 'nullable|integer|in:1,2,3',
        ]);

        try {
            $filters = array_merge(
                $request->only(['start_date', 'end_date']),
                ['user_id' => $request->user()->id],
                ['issue_status' => 'issued']
            );

            $history = $this->exportHistoryService->executeExcel(
                MyPageCashReceiptExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'cash_receipts'
            );

            return $this->responseSuccess(200, '내보내기 요청이 접수되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError(500, '현금영수증 내보내기에 실패하였습니다.', [$e->getMessage()]);
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
}
