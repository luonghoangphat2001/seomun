<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\FileType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Banner\AdminBannerImageUploadRequest;
use App\Http\Requests\Admin\Banner\AdminBannerListRequest;
use App\Http\Requests\Admin\Banner\AdminBannerStoreRequest;
use App\Http\Requests\Admin\Banner\AdminBannerUpdateRequest;
use App\Http\Resources\Admin\AdminBannerResource;
use App\Services\Admin\AdminBannerService;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminBannerController extends BaseController
{
    public function __construct(
        protected AdminBannerService $adminBannerService,
        protected FileService $fileService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Upload image for banner. Returns path to use in image_path.
     */
    public function uploadImage(AdminBannerImageUploadRequest $request): JsonResponse
    {
        try {
            $path = $request->file('file')->store('banners', 'public');
            $this->fileService->create($request->file('file'), $path, FileType::BANNERS, $request->user());

            return $this->responseSuccess(201, '이미지가 성공적으로 업로드되었습니다.', [
                'path' => $path,
                'url' => asset('storage/' . $path),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get search filter options for banners.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminBannerService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get list of banners for Super Admin.
     */
    public function index(AdminBannerListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminBannerService->getBanners($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '배너 목록이 성공적으로 조회되었습니다.', [
                'banners' => AdminBannerResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single banner detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $banner = $this->adminBannerService->getBanner($id);

            return $this->responseSuccess(200, '배너가 성공적으로 조회되었습니다.', [
                'banner' => new AdminBannerResource($banner),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Register a new banner.
     */
    public function store(AdminBannerStoreRequest $request): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $banner = $this->adminBannerService->createBanner($adminUser, $data);

            return $this->responseSuccess(201, '배너가 성공적으로 생성되었습니다.', [
                'banner' => new AdminBannerResource($banner->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update a banner.
     */
    public function update(AdminBannerUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $banner = $this->adminBannerService->updateBanner($id, $data);

            return $this->responseSuccess(200, '배너가 성공적으로 수정되었습니다.', [
                'banner' => new AdminBannerResource($banner->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete a banner.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminBannerService->deleteBanner($id);

            return $this->responseSuccess(200, '배너가 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
