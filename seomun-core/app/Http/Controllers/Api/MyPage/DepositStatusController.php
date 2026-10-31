<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\MyPage\MyPageDepositStatusExport;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Http\Resources\DepositStatusResource;
use App\Services\MyPage\MyPageDepositStatusService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DepositStatusController extends BaseController
{
    public function __construct(
        protected MyPageDepositStatusService $service,
        protected PaginationService $paginationService,
        protected AdminExportHistoryService $exportHistoryService,
    ) {}

    /**
     * GET /api/mypage/deposit-status
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page'   => 'nullable|integer|min:1|max:100',
            'months'     => 'nullable|integer|in:1,3,6',
            'search'     => 'nullable|string|max:100',
            'start_date' => 'nullable|date|before_or_equal:end_date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
        ]);

        try {
            $filters   = $request->only(['months', 'search', 'start_date', 'end_date']);
            $paginator = $this->service->getList(
                $request->user(),
                $filters,
                (int) $request->input('per_page', 15)
            );

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'items' => DepositStatusResource::collection($paginator->items()),
                'total' => $this->service->getTotal($request->user(), $filters),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError(500, '입금현황을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    public function exportExcel(Request $request): JsonResponse
    {
        Validator::make($request->all(), [
            'months'     => 'nullable|integer|in:1,3,6',
            'search'    => 'nullable|string|max:100',
            'start_date' => 'nullable|date|before_or_equal:end_date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
        ]);

        try {
            $filters = array_merge(
                $request->only(['months', 'search', 'start_date', 'end_date']),
                ['user_id' => $request->user()->id]
            );

            $history = $this->exportHistoryService->executeExcel(
                MyPageDepositStatusExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'deposit_status'
            );

            return $this->responseSuccess(200, '내보내기 요청이 접수되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError(500, '입금현황 내보내기에 실패하였습니다.', [$e->getMessage()]);
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
}
