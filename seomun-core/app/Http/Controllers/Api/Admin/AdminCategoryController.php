<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Enums\FileType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminCategoryExport;
use App\Http\Requests\Admin\Category\AdminCategoryExportRequest;
use App\Http\Requests\Admin\Category\AdminCategoryExposureImageUploadRequest;
use App\Http\Requests\Admin\Category\AdminCategoryExposureRequest;
use App\Http\Requests\Admin\Category\AdminCategoryListRequest;
use App\Http\Requests\Admin\Category\AdminCategoryReorderRequest;
use App\Http\Requests\Admin\Category\AdminCategoryStoreRequest;
use App\Http\Requests\Admin\Category\AdminCategoryUpdateRequest;
use App\Http\Resources\Admin\AdminCategoryDetailResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Services\Admin\AdminCategoryService;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminCategoryController extends BaseController
{
    public function __construct(
        protected AdminCategoryService $adminCategoryService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected FileService $fileService
    ) {}

    /**
     * Get search filter options for categories.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminCategoryService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Upload banner or icon image for category exposure. Returns path (use in PUT exposure) and full url.
     */
    public function uploadExposureImage(AdminCategoryExposureImageUploadRequest $request): JsonResponse
    {
        try {
            $type = $request->validated('type'); // banner | icon
            $dir = 'categories/exposure-'.$type;
            $path = $request->file('file')->store($dir, 'public');
            $this->fileService->create($request->file('file'), $path, FileType::CATEGORY_EXPOSURE, $request->user());

            return $this->responseSuccess(201, '이미지가 성공적으로 업로드되었습니다.', [
                'path' => $path,
                'url' => asset('storage/'.$path),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get list of categories for Super Admin.
     */
    public function index(AdminCategoryListRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 20);
        $page = (int) ($filters['current_page'] ?? 1);
        // tree=true → nested (categories[].children), pagination by root. tree=false → flat list.
        $isTree = (bool) ($filters['tree'] ?? true);

        $result = $this->adminCategoryService->getCategories($filters, $perPage);

        if ($isTree) {
            assert(is_array($result));
            $data = $this->adminCategoryService->paginateTreeRoots($result, $page, $perPage);
        } else {
            assert($result instanceof \Illuminate\Pagination\LengthAwarePaginator);
            $data = $this->adminCategoryService->formatListResponse($result);
        }

        return $this->responsePaginatedSuccess(200, '카테고리 목록이 성공적으로 조회되었습니다.', [
            'categories' => $data['categories'],
        ], $data['pagination']);
    }

    /**
     * Get single category detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $category = $this->adminCategoryService->getCategory($id);

            return $this->responseSuccess(200, '카테고리가 성공적으로 조회되었습니다.', [
                'category' => new AdminCategoryDetailResource($category),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Register a new category.
     */
    public function store(AdminCategoryStoreRequest $request): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $category = $this->adminCategoryService->createCategory($adminUser, $data);

            return $this->responseSuccess(201, '카테고리가 성공적으로 생성되었습니다.', [
                'category' => new AdminCategoryDetailResource($category->load(['parent', 'createdBy'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update category basic information.
     */
    public function update(AdminCategoryUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $category = $this->adminCategoryService->updateCategory($id, $data);

            return $this->responseSuccess(200, '카테고리가 성공적으로 수정되었습니다.', [
                'category' => new AdminCategoryDetailResource($category->load(['parent', 'createdBy'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete category.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminCategoryService->deleteCategory($id);

            return $this->responseSuccess(200, '카테고리가 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update category exposure information.
     */
    public function updateExposure(AdminCategoryExposureRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $category = $this->adminCategoryService->updateCategoryExposure($id, $data);

            return $this->responseSuccess(200, '카테고리 노출 정보가 성공적으로 수정되었습니다.', [
                'category' => new AdminCategoryDetailResource($category->load(['parent', 'createdBy'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update category sort order (drag-and-drop).
     */
    public function updateSortOrder(AdminCategoryReorderRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            $this->adminCategoryService->updateSortOrder($data['categories']);

            return $this->responseSuccess(200, '카테고리 순서가 성공적으로 변경되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Export categories to Excel. Supports export_type: ALL, CURRENT_PAGE, SELECTED.
     */
    public function exportExcel(AdminCategoryExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminCategoryExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'categories'
            );

            return $this->responseSuccess(200, '내보내기 요청이 접수되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError(500, '카테고리 내보내기에 실패하였습니다.', [$e->getMessage()]);
        }
    }

    /**
     * Check progress status of category export.
     */
    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        return $this->responseSuccess(200, '내보내기 진행 상태가 성공적으로 조회되었습니다.', [
            'history' => new AdminExportHistory($history),
        ]);
    }

    /**
     * Download category export file.
     */
    public function download(ExportHistory $history)
    {
        if (! $history) {
            return $this->responseError(404, '내보내기 기록을 찾을 수 없습니다.');
        }

        if ($history->status !== ExcelHistoryStatus::COMPLETED) {
            return $this->responseError(400, '내보내기가 아직 완료되지 않았습니다.');
        }

        // Try public disk first (new files), then local disk (old files)
        $disk = Storage::disk('public');
        if (! $disk->exists($history->file_path)) {
            $disk = Storage::disk('local');
            if (! $disk->exists($history->file_path)) {
                return $this->responseError(404, '내보내기 파일을 찾을 수 없습니다.');
            }
        }

        return $disk->download($history->file_path, $history->file_name, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$history->file_name.'"',
        ]);
    }
}
