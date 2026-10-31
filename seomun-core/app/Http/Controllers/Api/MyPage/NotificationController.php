<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MyPage\NotificationIndexRequest;
use App\Http\Resources\MemberNotificationResource;
use App\Services\MyPage\MemberNotificationService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends BaseController
{
    public function __construct(
        private readonly MemberNotificationService $notificationService,
        private readonly PaginationService $paginationService,
    ) {}

    public function index(NotificationIndexRequest $request): JsonResponse
    {
        try {
            $notifications = $this->notificationService->paginate($request->user(), $request->validated());

            return $this->responsePaginatedSuccess(200, 'successfully', [
                'notifications' => MemberNotificationResource::collection($notifications->items()),
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ], $this->paginationService->format($notifications));
        } catch (\Throwable $e) {
            Log::error('Get member notifications failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '알림 목록을 가져오는 중 오류가 발생했습니다.');
        }
    }

    public function markAsRead(Request $request, string $notificationId): JsonResponse
    {
        try {
            $notification = $this->notificationService->markAsRead($request->user(), $notificationId);

            return $this->responseSuccess(200, '알림을 읽음 처리했습니다.', [
                'notification' => new MemberNotificationResource($notification),
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ]);
        } catch (ModelNotFoundException) {
            return $this->responseError(404, '알림을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Mark member notification as read failed', [
                'user_id' => $request->user()?->id,
                'notification_id' => $notificationId,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '알림 읽음 처리 중 오류가 발생했습니다.');
        }
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $updatedCount = $this->notificationService->markAllAsRead($request->user());

            return $this->responseSuccess(200, '모든 알림을 읽음 처리했습니다.', [
                'updated_count' => $updatedCount,
                'unread_count' => 0,
            ]);
        } catch (\Throwable $e) {
            Log::error('Mark all member notifications as read failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '전체 알림 읽음 처리 중 오류가 발생했습니다.');
        }
    }
}
