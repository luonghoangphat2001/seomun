<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminErpOptionExport;
use App\Http\Requests\Admin\ErpOption\AdminErpOptionExportRequest;
use App\Http\Requests\Admin\ErpOption\AdminErpOptionStoreRequest;
use App\Http\Requests\Admin\ErpOption\AdminErpOptionUpdateRequest;
use App\Http\Requests\Admin\ErpOption\AdminErpOptionListRequest;
use App\Http\Resources\Admin\AdminErpOptionResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Services\Admin\AdminErpOptionService;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminErpOptionController extends BaseController
{
    public function __construct(
        protected AdminErpOptionService $adminErpOptionService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaginationService $paginationService,

    ) {}

    /**
     * Get search filter options for ERP options.
     * ERP 옵션 검색 필터 옵션 조회
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminErpOptionService->getSearchFilters();

            return response()->json([
                'success' => true,
                'data' => [
                    'filters' => $filters,
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
     * Get list of ERP options for Super Admin.
     * ERP 옵션 목록 조회 (관리자)
     */
    public function index(AdminErpOptionListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminErpOptionService->getErpOptions($filters, $perPage);

            return $this->responsePaginatedSuccess(200, 'ERP 옵션 목록이 성공적으로 조회되었습니다.', [
                'erp_options' => AdminErpOptionResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get single ERP option detail.
     * ERP 옵션 상세 조회 (관리자)
     */
    public function show(int $id): JsonResponse
    {
        try {
            $erpOption = $this->adminErpOptionService->getErpOption($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'erp_option' => new AdminErpOptionResource($erpOption),
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
     * Create a new ERP option.
     * ERP 옵션 생성 (관리자)
     */
    public function store(AdminErpOptionStoreRequest $request): JsonResponse
    {
        try {
            $erpOption = $this->adminErpOptionService->createErpOption($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'ERP 옵션이 성공적으로 생성되었습니다.',
                'data' => [
                    'erp_option' => new AdminErpOptionResource($erpOption),
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Update an existing ERP option.
     * ERP 옵션 수정 (관리자)
     */
    public function update(AdminErpOptionUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $erpOption = $this->adminErpOptionService->updateErpOption($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'ERP 옵션이 성공적으로 수정되었습니다.',
                'data' => [
                    'erp_option' => new AdminErpOptionResource($erpOption),
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
     * Delete an ERP option.
     * ERP 옵션 삭제 (관리자)
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminErpOptionService->deleteErpOption($id);

            return response()->json([
                'success' => true,
                'message' => 'ERP 옵션이 성공적으로 삭제되었습니다.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Export ERP options to Excel. Supports export_type: ALL, CURRENT_PAGE, SELECTED.
     * ERP 옵션 Excel 다운로드
     */
    public function exportExcel(AdminErpOptionExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminErpOptionExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'erp-product-options'
            );

            return response()->json([
                'success' => true,
                'message' => '내보내기 요청이 접수되었습니다.',
                'data' => [
                    'history' => new AdminExportHistory($history),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'ERP 옵션 내보내기 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Check export progress status (ERP product options).
     * ERP 옵션 Excel 다운로드 진행 상태 확인
     */
    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'history' => new AdminExportHistory($history),
            ],
        ]);
    }

    /**
     * Download exported Excel file (ERP product options).
     * ERP 옵션 Excel 파일 다운로드
     */
    public function download(ExportHistory $history): \Symfony\Component\HttpFoundation\StreamedResponse|JsonResponse
    {
        if ($history->status !== ExcelHistoryStatus::COMPLETED) {
            return response()->json([
                'success' => false,
                'message' => '내보내기가 아직 완료되지 않았습니다.',
            ], 400);
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($history->file_path)) {
            $disk = Storage::disk('local');
            if (! $disk->exists($history->file_path)) {
                return response()->json([
                    'success' => false,
                    'message' => '내보내기 파일을 찾을 수 없습니다.',
                ], 404);
            }
        }

        return $disk->download($history->file_path, $history->file_name, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$history->file_name.'"',
        ]);
    }
}
