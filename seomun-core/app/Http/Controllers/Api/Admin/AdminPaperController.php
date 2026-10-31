<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Paper\AdminPaperListRequest;
use App\Http\Requests\Admin\Paper\AdminPaperStoreRequest;
use App\Http\Requests\Admin\Paper\AdminPaperUpdateRequest;
use App\Services\Admin\AdminPaperService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminPaperController extends BaseController
{
    public function __construct(
        protected AdminPaperService $paperService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get list of papers with filters and pagination.
     */
    public function index(AdminPaperListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $papers = $this->paperService->getPapers($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '용지 목록이 성공적으로 조회되었습니다.', [
                'papers' => $papers->items(),
            ], $this->paginationService->format($papers));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single paper by ID.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $paper = $this->paperService->getPaper($id);

            return response()->json([
                'success' => true,
                'data' => ['paper' => $paper],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new paper.
     */
    public function store(AdminPaperStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            $paper = $this->paperService->createPaper($request->user(), $data);

            return response()->json([
                'success' => true,
                'message' => '용지가 성공적으로 생성되었습니다.',
                'data' => ['paper' => $paper],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a paper.
     */
    public function update(AdminPaperUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $paper = $this->paperService->updatePaper($id, $data);

            return response()->json([
                'success' => true,
                'message' => '용지가 성공적으로 수정되었습니다.',
                'data' => ['paper' => $paper],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Delete a paper.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->paperService->deletePaper($id);

            return response()->json([
                'success' => true,
                'message' => '용지가 성공적으로 삭제되었습니다.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
