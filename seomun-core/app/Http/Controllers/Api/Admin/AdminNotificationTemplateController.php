<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Notification\AdminNotificationTemplateListRequest;
use App\Http\Requests\Admin\Notification\AdminNotificationTemplateStoreRequest;
use App\Http\Requests\Admin\Notification\AdminNotificationTemplateToggleStatusRequest;
use App\Http\Requests\Admin\Notification\AdminNotificationTemplateUpdateRequest;
use App\Http\Resources\Admin\AdminNotificationTemplateResource;
use App\Services\Admin\AdminNotificationTemplateService;
use Illuminate\Http\JsonResponse;

class AdminNotificationTemplateController extends BaseController
{
    public function __construct(
        protected AdminNotificationTemplateService $adminNotificationTemplateService
    ) {}

    /**
     * Get search filter options for notification templates.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminNotificationTemplateService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get notification template list with filters.
     */
    public function index(AdminNotificationTemplateListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminNotificationTemplateService->getTemplates($filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => $this->adminNotificationTemplateService->formatListResponse($paginator),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single notification template detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $template = $this->adminNotificationTemplateService->getTemplate($id);

            return $this->responseSuccess(200, '알림 템플릿이 성공적으로 조회되었습니다.', [
                'template' => new AdminNotificationTemplateResource($template),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Register a new notification template.
     */
    public function store(AdminNotificationTemplateStoreRequest $request): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $template = $this->adminNotificationTemplateService->createTemplate($adminUser, $data);

            return $this->responseSuccess(201, '알림 템플릿이 성공적으로 생성되었습니다.', [
                'template' => new AdminNotificationTemplateResource($template->load('creator')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update an existing notification template.
     */
    public function update(AdminNotificationTemplateUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $template = $this->adminNotificationTemplateService->updateTemplate($id, $data);

            return $this->responseSuccess(200, '알림 템플릿이 성공적으로 수정되었습니다.', [
                'template' => new AdminNotificationTemplateResource($template->load('creator')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete a notification template.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminNotificationTemplateService->deleteTemplate($id);

            return $this->responseSuccess(200, '알림 템플릿이 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Copy a notification template.
     */
    public function copy(int $id): JsonResponse
    {
        try {
            $template = $this->adminNotificationTemplateService->copyTemplate($id);

            return $this->responseSuccess(201, '알림 템플릿이 성공적으로 복사되었습니다.', [
                'template' => new AdminNotificationTemplateResource($template),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Toggle usage status of a notification template.
     */
    public function toggleStatus(AdminNotificationTemplateToggleStatusRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $template = $this->adminNotificationTemplateService->toggleStatus($id, $data['usage_status']);

            return $this->responseSuccess(200, '알림 템플릿 상태가 성공적으로 변경되었습니다.', [
                'template' => new AdminNotificationTemplateResource($template),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
