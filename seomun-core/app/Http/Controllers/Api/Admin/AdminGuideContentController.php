<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\FileType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\Admin\AdminGuideContentResource;
use App\Services\Admin\AdminGuideContentService;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminGuideContentController extends BaseController
{
    public function __construct(
        protected AdminGuideContentService $adminGuideContentService,
        protected FileService $fileService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for guide contents.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminGuideContentService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Upload attachment for guide content.
     */
    public function uploadAttachment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file' => 'required|file|max:10240', // 10MB limit
            ]);

            $file = $request->file('file');
            $path = $file->store('guide-contents-attachments', 'public');
            $this->fileService->create($file, $path, FileType::GUIDE_CONTENT_ATTACHMENTS, $request->user());

            return $this->responseSuccess(201, '첨부파일이 성공적으로 업로드되었습니다.', [
                'key' => $path,
                'name' => $file->getClientOriginalName(),
                'url' => asset('storage/' . $path),
                'size' => $file->getSize(),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get list of guide contents for Super Admin.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->all();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminGuideContentService->getGuideContents($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '가이드 콘텐츠 목록이 성공적으로 조회되었습니다.', [
                'guide_contents' => AdminGuideContentResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single guide content detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $guideContent = $this->adminGuideContentService->getGuideContent($id);

            return $this->responseSuccess(200, '가이드 콘텐츠가 성공적으로 조회되었습니다.', [
                'guide_content' => new AdminGuideContentResource($guideContent),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Register a new guide content.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'type' => 'nullable|string|max:50',
                'attachments' => 'nullable|array',
                'attachments.*.key' => 'required_with:attachments|string',
                'attachments.*.name' => 'required_with:attachments|string',
                'attachments.*.url' => 'required_with:attachments|string',
                'attachments.*.size' => 'required_with:attachments|integer',
                'exposure_status' => 'required|string|in:exposed,non-exposed',
                'exposure_start_date' => 'nullable|date',
                'exposure_end_date' => 'nullable|date',
                'exposure_target' => 'nullable',
            ]);

            $guideContent = $this->adminGuideContentService->createGuideContent($adminUser, $data);

            return $this->responseSuccess(201, '가이드 콘텐츠가 성공적으로 생성되었습니다.', [
                'guide_content' => new AdminGuideContentResource($guideContent->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update guide content.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'title' => 'nullable|string|max:255',
                'content' => 'nullable|string',
                'type' => 'nullable|string|max:50',
                'attachments' => 'nullable|array',
                'attachments.*.key' => 'required_with:attachments|string',
                'attachments.*.name' => 'required_with:attachments|string',
                'attachments.*.url' => 'required_with:attachments|string',
                'attachments.*.size' => 'required_with:attachments|integer',
                'exposure_status' => 'nullable|string|in:exposed,non-exposed',
                'exposure_start_date' => 'nullable|date',
                'exposure_end_date' => 'nullable|date',
                'exposure_target' => 'nullable',
            ]);

            $guideContent = $this->adminGuideContentService->updateGuideContent($id, $data);

            return $this->responseSuccess(200, '가이드 콘텐츠가 성공적으로 수정되었습니다.', [
                'guide_content' => new AdminGuideContentResource($guideContent->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete guide content.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminGuideContentService->deleteGuideContent($id);

            return $this->responseSuccess(200, '가이드 콘텐츠가 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
