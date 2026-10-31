<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminProductStatisticsExport;
use App\Http\Requests\Admin\Product\AdminProductStatisticsRequest;
use App\Http\Resources\AdminExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminProductStatisticsService;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;

class AdminProductStatisticsController extends BaseController
{
    public function __construct(
        protected AdminProductStatisticsService $adminProductStatisticsService,
        protected AdminExportHistoryService $exportHistoryService
    ) {}

    /**
     * Get all product statistics
     */
    public function index(AdminProductStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $export = $request->get('export', false);

            // Get comprehensive statistics
            $statistics = [
                'sales_volume' => $this->adminProductStatisticsService->getSalesVolumeByProduct($filters),
                'top_n_products' => $this->adminProductStatisticsService->getTopNSalesProducts(
                    $filters['limit'] ?? 10,
                    $filters
                ),
                'promoted_products_ctr' => $this->adminProductStatisticsService->getPromotedProductsCTR($filters),
                'statistics_by_status' => $this->adminProductStatisticsService->getStatisticsByStatus($filters),
            ];

            // Calculate summary from existing data (no additional queries)
            $summary = $this->calculateSummary($statistics);
            $statistics['summary'] = $summary;

            // Export excel
            $filters['user_id'] = $request->user()->id;
            if ($export) {
                return $this->handleExportRequest($filters);
            }

            return $this->responseSuccess(200, '상품 통계 데이터가 성공적으로 조회되었습니다.', $statistics);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Calculate summary statistics from existing data (no additional queries)
     */
    private function calculateSummary(array $statistics): array
    {
        $salesVolume = $statistics['sales_volume'] ?? [];
        $topProducts = $statistics['top_n_products'] ?? [];
        $ctrData = $statistics['promoted_products_ctr'] ?? [];
        $statusData = $statistics['statistics_by_status'] ?? [];

        // Calculate key metrics from sales_volume data
        $totalProducts = count($salesVolume);
        $activeProducts = count(array_filter($salesVolume, fn ($item) => $item['is_active']));
        $totalRevenue = array_sum(array_column($salesVolume, 'total_revenue'));
        $totalQuantitySold = array_sum(array_column($salesVolume, 'total_quantity'));

        // Calculate metrics from status data
        $hiddenProducts = $statusData['hidden']['product_count'] ?? 0;
        // Get top performers
        $bestSellingProduct = $topProducts[0] ?? null;

        // Calculate CTR metrics
        $avgCtr = ! empty($ctrData) ? array_sum(array_column($ctrData, 'ctr')) / count($ctrData) : 0;

        return [
            'total_products' => [
                'total' => $totalProducts,
                'unit' => 'count',
            ],
            'active_products' => [
                'total' => $activeProducts,
                'unit' => 'count',
            ],
            'best_seller' => [
                'total' => $bestSellingProduct['total_quantity'] ?? 0,
                'total_amount' => $bestSellingProduct['total_revenue'] ?? 0,
                'unit' => 'count',
                'product_name' => $bestSellingProduct['name'] ?? null,
            ],
            'avg_ctr' => [
                'total' => round($avgCtr, 2),
                'unit' => 'percent',
            ],
            'hidden_sold_out' => [
                'total' => $hiddenProducts,
                'unit' => 'count',
            ],
            'total_sales' => [
                'total' => $totalQuantitySold,
                'total_amount' => $totalRevenue,
                'unit' => 'count',
            ],
            'total_revenue' => [
                'total' => round($totalRevenue, 2),
                'total_amount' => $totalRevenue,
                'unit' => 'currency',
            ],
        ];
    }

    /**
     * Handle export request for product statistics
     */
    private function handleExportRequest(array $filters)
    {
        try {
            $export = AdminProductStatisticsExport::class;
            $baseName = 'product_statistics';
            $basePath = $baseName.'_'.now()->format('Y-m-d_H-i-s');
            $basePath = str_replace(' ', '_', $basePath);
            $history = $this->exportHistoryService->executeExcel($export, $filters, $filters['user_id'], $basePath, $baseName);

            return $this->responseSuccess(200, '상품 통계 내보내기 요청이 접수되었습니다.', new AdminExportHistory($history));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get sales volume by product
     */
    public function salesVolume(AdminProductStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $data = $this->adminProductStatisticsService->getSalesVolumeByProduct($filters);

            return $this->responseSuccess(200, '판매량 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get top N sales products
     */
    public function topNSales(AdminProductStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $data = $this->adminProductStatisticsService->getTopNSalesProducts(
                $filters['limit'] ?? 10,
                $filters
            );

            return $this->responseSuccess(200, '상위 판매 상품 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get promoted products CTR
     */
    public function promotedProductsCTR(AdminProductStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $data = $this->adminProductStatisticsService->getPromotedProductsCTR($filters);

            return $this->responseSuccess(200, 'CTR 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get statistics by product status
     */
    public function statisticsByStatus(AdminProductStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $data = $this->adminProductStatisticsService->getStatisticsByStatus($filters);

            return $this->responseSuccess(200, '상태별 통계 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
