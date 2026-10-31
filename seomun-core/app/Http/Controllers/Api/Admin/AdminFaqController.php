<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Faq\AdminFaqListRequest;
use App\Http\Requests\Admin\Faq\AdminFaqStoreRequest;
use App\Http\Requests\Admin\Faq\AdminFaqUpdateRequest;
use App\Http\Resources\Admin\AdminFaqResource;
use App\Services\Admin\AdminFaqService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminFaqController extends BaseController
{
    public function __construct(
        protected AdminFaqService $adminFaqService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get search filter options for FAQs.
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminFaqService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get list of FAQs for Super Admin.
     */
    public function index(AdminFaqListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->adminFaqService->getFaqs($filters, $perPage);

            return $this->responsePaginatedSuccess(200, 'FAQ 목록이 성공적으로 조회되었습니다.', [
                'faqs' => AdminFaqResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single FAQ detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $faq = $this->adminFaqService->getFaq($id);

            return $this->responseSuccess(200, 'FAQ가 성공적으로 조회되었습니다.', [
                'faq' => new AdminFaqResource($faq),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Register a new FAQ.
     */
    public function store(AdminFaqStoreRequest $request): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $faq = $this->adminFaqService->createFaq($adminUser, $data);

            return $this->responseSuccess(201, 'FAQ가 성공적으로 생성되었습니다.', [
                'faq' => new AdminFaqResource($faq->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update a FAQ.
     */
    public function update(AdminFaqUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $faq = $this->adminFaqService->updateFaq($id, $data);

            return $this->responseSuccess(200, 'FAQ가 성공적으로 수정되었습니다.', [
                'faq' => new AdminFaqResource($faq->load('createdBy')),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete a FAQ.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminFaqService->deleteFaq($id);

            return $this->responseSuccess(200, 'FAQ가 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
