<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminInquiryStatisticsExport;
use App\Http\Requests\Admin\Inquiry\AdminInquiryStatisticsRequest;
use App\Http\Resources\AdminExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminInquiryStatisticsService;
use Illuminate\Http\JsonResponse;

class AdminInquiryStatisticsController extends BaseController
{
    public function __construct(
        protected AdminInquiryStatisticsService $adminInquiryStatisticsService,
        protected AdminExportHistoryService $adminExportHistoryService
    ) {}

    /**
     * Get inquiry statistics
     */
    public function index(AdminInquiryStatisticsRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $export = $request->boolean('export', false);

            $customerIds = $validated['customer_ids'] ?? [];
            if (is_string($customerIds)) {
                $customerIds = explode(',', $customerIds);
            }

            $config = [];
            if (isset($validated['start_date']) && isset($validated['end_date'])) {
                $config['start_date'] = $validated['start_date'];
                $config['end_date'] = $validated['end_date'];
            } else {
                $period = $validated['period'] ?? '30d';
                $config = $this->adminInquiryStatisticsService->periodConfig($period);
            }

            $data = $this->adminInquiryStatisticsService->getInquiryStatistics($customerIds, $config);

            if ($export) {
                $userId = $request->user()?->id ?? 1;
                $baseName = 'inquiry_statistics';
                $basePath = $baseName.'_'.now()->format('Y-m-d_H-i-s');
                $basePath = str_replace(' ', '_', $basePath);

                $history = $this->adminExportHistoryService->executeExcel(
                    AdminInquiryStatisticsExport::class,
                    $data,
                    $userId,
                    $basePath,
                    $baseName
                );

                return $this->responseSuccess(200, '문의 통계 내보내기 요청이 접수되었습니다.', new AdminExportHistory($history));
            }

            return $this->responseSuccess(200, '문의 통계 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Exception $e) {
            return $this->responseError(500, '문의 통계 데이터 조회에 실패하였습니다.', [$e->getMessage()]);
        }
    }
}
