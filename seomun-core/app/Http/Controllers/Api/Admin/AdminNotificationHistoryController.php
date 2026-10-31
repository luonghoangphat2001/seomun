<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Notification\AdminNotificationHistoryListRequest;
use App\Http\Requests\Admin\Notification\AdminNotificationHistoryResendRequest;
use App\Http\Resources\Admin\AdminNotificationHistoryResource;
use App\Models\NotificationHistory;
use App\Services\Admin\AdminNotificationHistoryService;
use Illuminate\Http\JsonResponse;

class AdminNotificationHistoryController extends BaseController
{
    public function __construct(
        protected AdminNotificationHistoryService $adminNotificationHistoryService
    ) {}

    /**
     * Get search filter options for notification sending history.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminNotificationHistoryService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get notification sending history list with filters.
     */
    public function index(AdminNotificationHistoryListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminNotificationHistoryService->getHistories($filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => $this->adminNotificationHistoryService->formatListResponse($paginator),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get notification sending history detail.
     */
    public function show(NotificationHistory $history): JsonResponse
    {
        try {
            $history->load(['template', 'sender']);

            return $this->responseSuccess(200, '알림 발송 내역이 성공적으로 조회되었습니다.', [
                'history' => new AdminNotificationHistoryResource($history),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Resend a notification based on history.
     */
    public function resend(AdminNotificationHistoryResendRequest $request, NotificationHistory $history): JsonResponse
    {
        try {
            $data = $request->validated();

            $newHistory = $this->adminNotificationHistoryService->resend($history, array_merge(
                $data,
                ['sender_id' => $request->user()?->id ?? $history->sender_id]
            ));

            return $this->responseSuccess(201, '알림이 성공적으로 재발송되었습니다.', [
                'history' => new AdminNotificationHistoryResource($newHistory->load(['template', 'sender'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
