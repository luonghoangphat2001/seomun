<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminMemberStatisticsExport;
use App\Http\Requests\Admin\Member\AdminMemberStatisticsRequest;
use App\Http\Resources\AdminExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminMemberStatisticsService;
use Illuminate\Http\JsonResponse;

class AdminMemberStatisticsController extends BaseController
{
    public function __construct(
        protected AdminMemberStatisticsService $adminMemberStatisticsService,
        protected AdminExportHistoryService $exportHistoryService
    ) {}

    /**
     * Get all member statistics
     */
    public function index(AdminMemberStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $export = $request->get('export', false);

            // Get comprehensive statistics from service
            $statistics = $this->adminMemberStatisticsService->getComprehensiveStatistics($filters);

            // Export excel
            $filters['user_id'] = $request->user()->id;
            if ($export) {
                return $this->handleExportRequest($filters);
            }

            return $this->responseSuccess(200, '회원 통계가 성공적으로 조회되었습니다.', $statistics);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Handle export request for member statistics
     */
    private function handleExportRequest(array $filters)
    {
        try {
            $export = AdminMemberStatisticsExport::class;
            $baseName = 'member_statistics';
            $basePath = $baseName.'_'.now()->format('Y-m-d_H-i-s');
            $basePath = str_replace(' ', '_', $basePath);
            $history = $this->exportHistoryService->executeExcel($export, $filters, $filters['user_id'], $basePath, $baseName);

            return $this->responseSuccess(200, '회원 통계 내보내기 요청이 접수되었습니다.', new AdminExportHistory($history));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get new members by period
     */
    public function newMembers(AdminMemberStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $data = $this->adminMemberStatisticsService->getNewMembersByPeriod($filters);

            return $this->responseSuccess(200, '신규 회원 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get withdrawn members by period
     */
    public function withdrawnMembers(AdminMemberStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $data = $this->adminMemberStatisticsService->getWithdrawnMembersByPeriod($filters);

            return $this->responseSuccess(200, '탈퇴 회원 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get active members by period
     */
    public function activeMembers(AdminMemberStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $data = $this->adminMemberStatisticsService->getActiveMembersByPeriod($filters);

            return $this->responseSuccess(200, '활성 회원 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get members by level
     */
    public function membersByLevel(AdminMemberStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $data = $this->adminMemberStatisticsService->getMembersByLevel($filters);

            return $this->responseSuccess(200, '등급별 회원 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get members by path
     */
    public function membersByPath(AdminMemberStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $data = $this->adminMemberStatisticsService->getMembersByPath($filters);

            return $this->responseSuccess(200, '가입 경로별 회원 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Export member statistics to Excel
     */
    public function export(AdminMemberStatisticsRequest $request)
    {
        try {
            $filters = $request->validated();
            $filters['user_id'] = $request->user()->id;

            return $this->handleExportRequest($filters);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
