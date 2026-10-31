<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\Admin\AdminOrderStatisticsExport;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\AdminDashboard\AdminDashboardOperationRequest;
use App\Http\Requests\Admin\AdminDashboard\AdminDashboardOrderStaticsRequest;
use App\Http\Resources\Admin\ExportHistoriesResource;
use App\Services\Admin\AdminDashboardService;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminOrderService;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends BaseController
{
    public function __construct(
        protected AdminDashboardService $adminDashboardService,
        protected AdminOrderService $adminOrderService,
        protected AdminExportHistoryService $exportHistoryService
    ) {}

    /**
     * Dashboard Operation (Summary Status)
     */
    public function operational(AdminDashboardOperationRequest $request): JsonResponse
    {
        $customerIds = $request->input('customer_ids', []);
        if (is_string($customerIds)) {
            $customerIds = explode(',', $customerIds);
        }
        $period = $request->input('period', '7d');

        $config = $this->adminDashboardService->periodConfig($period);

        $data = [
            'metric' => $this->adminDashboardService->metric($customerIds, $config),
            'notifications_hot' => $this->adminDashboardService->notificationHighlight(),
            'graph_data' => $this->adminDashboardService->getGraphData($customerIds, $config),
        ];

        return $this->responseSuccess(200, '운영 대시보드 데이터가 성공적으로 조회되었습니다.', $data);
    }

    /**
     * Dashboard Order Static
     */
    public function orderStatic(AdminDashboardOrderStaticsRequest $request): JsonResponse
    {
        try {
            $customerIds = $request->input('customer_ids', []);
            if (is_string($customerIds)) {
                $customerIds = trim($customerIds);
                $customerIds = explode(',', $customerIds);
            }
            $export = $request->boolean('export', false);
            $period = $request->input('period', '30d');
            $configPeriod = $this->adminOrderService->configPeriod($period);
            $data = $this->adminOrderService->getOrderStatics($customerIds, $configPeriod);

            if ($export) {
                $export = AdminOrderStatisticsExport::class;
                $baseName = 'order_static';
                $basePath = $baseName.' '.now()->format('Y-m-d H:i:s');
                $history = $this->exportHistoryService->executeExcel($export, $data, 1, $basePath, $baseName);

                return $this->responseSuccess(200, '주문 통계 데이터가 성공적으로 조회되었습니다.', new ExportHistoriesResource($history));
            }

            return $this->responseSuccess(200, '주문 통계 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Exception $e) {
            return $this->responseError(500, '주문 통계 데이터 조회에 실패하였습니다.', [$e->getMessage()]);
        }
    }
}
