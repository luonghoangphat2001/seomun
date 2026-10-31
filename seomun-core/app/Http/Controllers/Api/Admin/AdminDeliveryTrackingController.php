<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminDeliveryTrackingExport;
use App\Http\Requests\Admin\DeliveryTracking\AdminDeliveryTrackingExportRequest;
use App\Http\Requests\Admin\DeliveryTracking\AdminDeliveryTrackingListRequest;
use App\Http\Resources\Admin\AdminDeliveryTrackingDetailResource;
use App\Http\Resources\Admin\AdminDeliveryTrackingResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Services\Admin\AdminDeliveryTrackingService;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminDeliveryTrackingController extends BaseController
{
    public function __construct(
        protected AdminDeliveryTrackingService $adminDeliveryTrackingService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for delivery tracking (배송 추적 검색 필터)
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminDeliveryTrackingService->getSearchFilters();

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
     * Get delivery tracking list (배송 추적 목록 조회)
     */
    public function index(AdminDeliveryTrackingListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);
            $trackings = $this->adminDeliveryTrackingService->getDeliveryTrackings($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '배송 추적 목록이 성공적으로 조회되었습니다.', [
                'delivery_trackings' => AdminDeliveryTrackingResource::collection($trackings->items()),
            ], $this->paginationService->format($trackings));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get delivery tracking detail by invoice number (배송 추적 상세 - 송장번호)
     */
    public function show(string $invoiceNumber): JsonResponse
    {
        try {
            $tracking = $this->adminDeliveryTrackingService->getByInvoiceNumber($invoiceNumber);

            if (! $tracking) {
                return response()->json([
                    'success' => false,
                    'message' => '해당 운송장 번호의 배송 추적 정보를 찾을 수 없습니다.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'delivery_tracking' => new AdminDeliveryTrackingDetailResource($tracking),
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
     * Export delivery tracking to Excel (배송 추적 Excel 다운로드)
     */
    public function exportExcel(AdminDeliveryTrackingExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $user = $request->user();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminDeliveryTrackingExport::class,
                $filters,
                (int) $user->id,
                'exports',
                'delivery_trackings'
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
}
