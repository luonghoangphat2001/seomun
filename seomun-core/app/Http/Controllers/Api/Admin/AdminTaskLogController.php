<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminTaskLogExport;
use App\Http\Requests\Admin\TaskLog\AdminTaskLogExportRequest;
use App\Http\Requests\Admin\TaskLog\AdminTaskLogListRequest;
use App\Http\Resources\Admin\AdminTaskLogResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminTaskLogService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminTaskLogController extends BaseController
{
    public function __construct(
        protected AdminTaskLogService $adminTaskLogService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get search filter options for task logs.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminTaskLogService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get list of task logs for Super Admin.
     */
    public function index(AdminTaskLogListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminTaskLogService->getTaskLogs($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '작업 로그 목록이 성공적으로 조회되었습니다.', [
                'task_logs' => AdminTaskLogResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Export task logs to Excel. Supports export_type: ALL, CURRENT_PAGE, SELECTED.
     */
    public function exportExcel(AdminTaskLogExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminTaskLogExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'task-logs'
            );

            return $this->responseSuccess(200, '내보내기 요청이 접수되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $th) {
            return $this->responseError(500, '작업 로그 내보내기에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    /**
     * Check export progress status.
     */
    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        try {
            return $this->responseSuccess(200, '내보내기 진행 상태가 성공적으로 조회되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Download exported Excel file.
     */
    public function download(ExportHistory $history): StreamedResponse|JsonResponse
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
            'Content-Disposition' => 'attachment; filename="' . $history->file_name . '"',
        ]);
    }
}
