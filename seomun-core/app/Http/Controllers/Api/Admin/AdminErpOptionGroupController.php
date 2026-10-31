<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminErpOptionGroupExport;
use App\Http\Requests\Admin\ErpOptionGroup\AdminErpOptionGroupExportRequest;
use App\Http\Requests\Admin\ErpOptionGroup\AdminErpOptionGroupStoreRequest;
use App\Http\Requests\Admin\ErpOptionGroup\AdminErpOptionGroupUpdateRequest;
use App\Http\Requests\Admin\ErpOptionGroup\AdminErpOptionGroupListRequest;
use App\Http\Resources\Admin\AdminErpOptionGroupResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Services\Admin\AdminErpOptionGroupService;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminErpOptionGroupController extends BaseController
{
    public function __construct(
        protected AdminErpOptionGroupService $adminErpOptionGroupService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaginationService $paginationService,

    ) {}

    /**
     * Get search filter options for ERP option groups.
     * ERP 옵션 그룹 검색 필터 옵션 조회
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminErpOptionGroupService->getSearchFilters();

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
     * Get list of ERP option groups for Super Admin.
     * ERP 옵션 그룹 목록 조회 (관리자)
     */
    public function index(AdminErpOptionGroupListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminErpOptionGroupService->getErpOptionGroups($filters, $perPage);

            return $this->responsePaginatedSuccess(200, 'ERP 옵션 그룹 목록이 성공적으로 조회되었습니다.', [
                'erp_option_groups' => AdminErpOptionGroupResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get single ERP option group detail.
     * ERP 옵션 그룹 상세 조회 (관리자)
     */
    public function show(int $id): JsonResponse
    {
        try {
            $erpOptionGroup = $this->adminErpOptionGroupService->getErpOptionGroup($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'erp_option_group' => new AdminErpOptionGroupResource($erpOptionGroup),
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
     * Create a new ERP option group.
     * ERP 옵션 그룹 생성 (관리자)
     */
    public function store(AdminErpOptionGroupStoreRequest $request): JsonResponse
    {
        try {
            $erpOptionGroup = $this->adminErpOptionGroupService->createErpOptionGroup($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'ERP 옵션 그룹이 성공적으로 생성되었습니다.',
                'data' => [
                    'erp_option_group' => new AdminErpOptionGroupResource($erpOptionGroup),
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
     * Update an existing ERP option group.
     * ERP 옵션 그룹 수정 (관리자)
     */
    public function update(AdminErpOptionGroupUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $erpOptionGroup = $this->adminErpOptionGroupService->updateErpOptionGroup($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'ERP 옵션 그룹이 성공적으로 수정되었습니다.',
                'data' => [
                    'erp_option_group' => new AdminErpOptionGroupResource($erpOptionGroup),
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
     * Delete an ERP option group.
     * ERP 옵션 그룹 삭제 (관리자)
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminErpOptionGroupService->deleteErpOptionGroup($id);

            return response()->json([
                'success' => true,
                'message' => 'ERP 옵션 그룹이 성공적으로 삭제되었습니다.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Export ERP option groups to Excel. Supports export_type: ALL, CURRENT_PAGE, SELECTED.
     * ERP 옵션 그룹 Excel 다운로드
     */
    public function exportExcel(AdminErpOptionGroupExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminErpOptionGroupExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'erp-option-groups'
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
                'message' => 'ERP 옵션 그룹 내보내기 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Check export progress status (ERP option groups).
     * ERP 옵션 그룹 Excel 다운로드 진행 상태 확인
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
     * Download exported Excel file (ERP option groups).
     * ERP 옵션 그룹 Excel 파일 다운로드
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
            'Content-Disposition' => 'attachment; filename="' . $history->file_name . '"',
        ]);
    }
}
