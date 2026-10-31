<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\FileType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Notice\AdminNoticeAttachmentUploadRequest;
use App\Http\Requests\Admin\Notice\AdminNoticeListRequest;
use App\Http\Requests\Admin\Notice\AdminNoticeStoreRequest;
use App\Http\Requests\Admin\Notice\AdminNoticeUpdateRequest;
use App\Http\Resources\Admin\AdminNoticeDetailResource;
use App\Http\Resources\Admin\AdminNoticeResource;
use App\Services\Admin\AdminNoticeService;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminNoticeController extends BaseController
{
    public function __construct(
        protected AdminNoticeService $adminNoticeService,
        protected FileService $fileService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get search filter options for notices.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminNoticeService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Upload attachment for notice. Returns path to send in attachments[] when creating/updating notice.
     * FSD: File up attachments.
     */
    public function uploadAttachment(AdminNoticeAttachmentUploadRequest $request): JsonResponse
    {
        try {
            $file = $request->file('file');
            $path = $file->store('notices-attachments', 'public');
            $this->fileService->create($file, $path, FileType::NOTICE_ATTACHMENTS, $request->user());
            return $this->responseSuccess(201, '첨부파일이 성공적으로 업로드되었습니다.', [
                'key' => $path,
                'name' => $file->getClientOriginalName(),
                'url' => asset('storage/'.$path),
                'size' => $file->getSize(),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get list of notices for Super Admin.
     */
    public function index(AdminNoticeListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminNoticeService->getNotices($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '공지사항 목록이 성공적으로 조회되었습니다.', [
                'notices' => AdminNoticeResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single notice detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $notice = $this->adminNoticeService->getNotice($id);

            return $this->responseSuccess(200, '공지사항이 성공적으로 조회되었습니다.', [
                'notice' => new AdminNoticeDetailResource($notice),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Register a new notice.
     */
    public function store(AdminNoticeStoreRequest $request): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $notice = $this->adminNoticeService->createNotice($adminUser, $data);

            return $this->responseSuccess(201, '공지사항이 성공적으로 생성되었습니다.', [
                'notice' => new AdminNoticeDetailResource($notice->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update notice.
     */
    public function update(AdminNoticeUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $notice = $this->adminNoticeService->updateNotice($id, $data);

            return $this->responseSuccess(200, '공지사항이 성공적으로 수정되었습니다.', [
                'notice' => new AdminNoticeDetailResource($notice->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete notice.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminNoticeService->deleteNotice($id);

            return $this->responseSuccess(200, '공지사항이 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
