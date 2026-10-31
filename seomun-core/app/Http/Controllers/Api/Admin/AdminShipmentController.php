<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminShipmentExport;
use App\Http\Requests\Admin\Shipment\AdminShipmentExportRequest;
use App\Http\Requests\Admin\Shipment\AdminShipmentListRequest;
use App\Http\Requests\Admin\Shipment\AdminShipmentUpdateTrackingRequest;
use App\Http\Resources\Admin\AdminShipmentResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Models\OrderShipment;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminShipmentService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminShipmentController extends BaseController
{
    public function __construct(
        protected AdminShipmentService $adminShipmentService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for shipments (출고 관리 검색 필터)
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminShipmentService->getSearchFilters();

            return response()->json([
                'success' => true,
                'data' => ['filters' => $filters],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get shipment list (출고 목록 조회)
     */
    public function index(AdminShipmentListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);
            $shipments = $this->adminShipmentService->getShipments($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '출고 목록이 성공적으로 조회되었습니다.', [
                'shipments' => AdminShipmentResource::collection($shipments->items()),
            ], $this->paginationService->format($shipments));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Export shipments to Excel (출고 목록 Excel 다운로드)
     */
    public function exportExcel(AdminShipmentExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $user = $request->user();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminShipmentExport::class,
                $filters,
                (int) $user->id,
                'exports',
                'shipments'
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'history' => new AdminExportHistory($history),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'history' => new AdminExportHistory($history),
            ],
        ]);
    }

    public function download(ExportHistory $history): StreamedResponse|JsonResponse
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

    /**
     * Update the tracking number (and optional carrier info) of a shipment (송장번호 등록/수정).
     */
    public function updateTrackingNumber(AdminShipmentUpdateTrackingRequest $request, OrderShipment $shipment): JsonResponse
    {
        try {
            $updated = $this->adminShipmentService->updateTrackingNumber(
                (int) $shipment->id,
                $request->validated()
            );

            return $this->responseSuccess(200, '송장번호가 성공적으로 수정되었습니다.', [
                'shipment' => new AdminShipmentResource($updated->load(['order.items.product', 'items.product'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
