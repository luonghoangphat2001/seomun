<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\FileType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Popup\AdminPopupImageUploadRequest;
use App\Http\Requests\Admin\Popup\AdminPopupListRequest;
use App\Http\Requests\Admin\Popup\AdminPopupStoreRequest;
use App\Http\Requests\Admin\Popup\AdminPopupUpdateRequest;
use App\Http\Resources\Admin\AdminPopupResource;
use App\Services\Admin\AdminPopupService;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminPopupController extends BaseController
{
    public function __construct(
        protected AdminPopupService $adminPopupService,
        protected FileService $fileService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Upload image for pop-up. Returns path to use in image_path (create/update).
     */
    public function uploadImage(AdminPopupImageUploadRequest $request): JsonResponse
    {
        try {
            $path = $request->file('file')->store('popups', 'public');
            $this->fileService->create($request->file('file'), $path, FileType::POPUPS, $request->user());

            return $this->responseSuccess(201, '이미지가 성공적으로 업로드되었습니다.', [
                'path' => $path,
                'url' => asset('storage/' . $path),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get search filter options for popups.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminPopupService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get list of popups for Super Admin.
     */
    public function index(AdminPopupListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminPopupService->getPopups($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '팝업 목록이 성공적으로 조회되었습니다.', [
                'popups' => AdminPopupResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single popup detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $popup = $this->adminPopupService->getPopup($id);

            return $this->responseSuccess(200, '팝업이 성공적으로 조회되었습니다.', [
                'popup' => new AdminPopupResource($popup),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Register a new popup.
     */
    public function store(AdminPopupStoreRequest $request): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $popup = $this->adminPopupService->createPopup($adminUser, $data);

            return $this->responseSuccess(201, '팝업이 성공적으로 생성되었습니다.', [
                'popup' => new AdminPopupResource($popup->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update a popup.
     */
    public function update(AdminPopupUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $popup = $this->adminPopupService->updatePopup($id, $data);

            return $this->responseSuccess(200, '팝업이 성공적으로 수정되었습니다.', [
                'popup' => new AdminPopupResource($popup->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete a popup.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminPopupService->deletePopup($id);

            return $this->responseSuccess(200, '팝업이 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
