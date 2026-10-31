<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminSettlementReportExport;
use App\Http\Requests\Admin\SettlementReport\SettlementReportRequest;
use App\Http\Resources\AdminExportHistory;
use App\Http\Resources\AdminSettlementReportResource;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminSettlementReportService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AdminSettlementReportController extends BaseController
{
    public function __construct(
        protected AdminSettlementReportService $adminSettlementReportService,
        protected PaginationService $paginationService,
        protected AdminExportHistoryService $adminExportHistoryService) {}

    /**
     * Get list sales report
     */
    public function index(SettlementReportRequest $request): JsonResponse
    {
        try {
            Log::info('Settlement Report index request received', $request->validated());

            $reports = $this->adminSettlementReportService->getPaginate($request->validated());

            Log::info('Settlement Report index request completed', [
                'total' => $reports->total(),
                'per_page' => $reports->perPage(),
                'current_page' => $reports->currentPage(),
            ]);

            return $this->responsePaginatedSuccess(200, '정산 보고서 목록이 성공적으로 조회되었습니다.', [
                'reports' => AdminSettlementReportResource::collection($reports->items()),
            ], $this->paginationService->format($reports));
        } catch (\Throwable $th) {
            Log::error('Settlement Report index error', [
                'message' => $th->getMessage(),
                'trace' => $th->getTraceAsString(),
            ]);

            return $this->responseError(500, '정산 보고서 목록 조회에 실패하였습니다.');
        }
    }

    /**
     * Check progress status of export
     */
    public function checkProgressStatus(int $history): JsonResponse
    {
        try {
            $exportHistory = ExportHistory::findOrFail($history);

            return $this->responseSuccess(200, '내보내기 진행 상태가 성공적으로 조회되었습니다.', [
                'history' => new AdminExportHistory($exportHistory),
            ]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '내보내기 기록을 찾을 수 없습니다.');
        } catch (\Throwable $th) {
            return $this->responseError(500, '진행 상태 조회에 실패하였습니다.');
        }
    }

    /**
     * Export sales report to Excel
     */
    public function exportExcel(Request $request): JsonResponse
    {
        try {
            $data = $request->all() ?? [];

            $history = $this->adminExportHistoryService->executeExcel(
                AdminSettlementReportExport::class,
                $data,
                $request->user()->id ?? 1,
                'exports',
                'settlement_reports'
            );

            return $this->responseSuccess(200, '내보내기 요청이 접수되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $th) {
            return $this->responseError(500, '정산 보고서 내보내기에 실패하였습니다.');
        }
    }

    public function download(ExportHistory $history)
    {
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
