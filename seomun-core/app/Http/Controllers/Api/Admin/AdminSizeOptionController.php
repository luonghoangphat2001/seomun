<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\SizeOption\AdminSizeOptionListRequest;
use App\Http\Requests\Admin\SizeOption\AdminSizeOptionStoreRequest;
use App\Http\Requests\Admin\SizeOption\AdminSizeOptionUpdateRequest;
use App\Services\Admin\AdminSizeOptionService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminSizeOptionController extends BaseController
{
    public function __construct(
        protected AdminSizeOptionService $sizeOptionService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get list of size options with filters and pagination.
     */
    public function index(AdminSizeOptionListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $sizeOptions = $this->sizeOptionService->getSizeOptions($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '사이즈 옵션 목록이 성공적으로 조회되었습니다.', [
                'size_options' => $sizeOptions->items(),
            ], $this->paginationService->format($sizeOptions));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single size option by ID.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $sizeOption = $this->sizeOptionService->getSizeOption($id);

            return response()->json([
                'success' => true,
                'data' => ['size_option' => $sizeOption],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new size option.
     */
    public function store(AdminSizeOptionStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            $sizeOption = $this->sizeOptionService->createSizeOption($request->user(), $data);

            return response()->json([
                'success' => true,
                'message' => '사이즈 옵션이 성공적으로 생성되었습니다.',
                'data' => ['size_option' => $sizeOption],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a size option.
     */
    public function update(AdminSizeOptionUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $sizeOption = $this->sizeOptionService->updateSizeOption($id, $data);

            return response()->json([
                'success' => true,
                'message' => '사이즈 옵션이 성공적으로 수정되었습니다.',
                'data' => ['size_option' => $sizeOption],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Delete a size option.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->sizeOptionService->deleteSizeOption($id);

            return response()->json([
                'success' => true,
                'message' => '사이즈 옵션이 성공적으로 삭제되었습니다.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}