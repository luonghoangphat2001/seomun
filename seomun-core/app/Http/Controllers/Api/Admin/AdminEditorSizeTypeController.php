<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\EditorSizeType\AdminEditorSizeTypeListRequest;
use App\Http\Requests\Admin\EditorSizeType\AdminEditorSizeTypeReorderRequest;
use App\Http\Requests\Admin\EditorSizeType\AdminEditorSizeTypeStoreRequest;
use App\Http\Requests\Admin\EditorSizeType\AdminEditorSizeTypeUpdateRequest;
use App\Services\Admin\AdminEditorSizeTypeService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminEditorSizeTypeController extends BaseController
{
    public function __construct(
        protected AdminEditorSizeTypeService $editorSizeTypeService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get list of editor size types with filters and pagination.
     */
    public function index(AdminEditorSizeTypeListRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 20);

        $categories = $this->editorSizeTypeService->getCategories($filters, $perPage);

        return $this->responsePaginatedSuccess(200, '편집기 크기 유형 목록이 성공적으로 조회되었습니다.', [
            'categories' => $categories->items(),
        ], $this->paginationService->format($categories));
    }

    /**
     * Get a single editor size type by ID.
     */
    public function show(int $id): JsonResponse
    {
        $category = $this->editorSizeTypeService->getCategory($id);

        return response()->json([
            'success' => true,
            'data' => ['category' => $category],
        ]);
    }

    /**
     * Store a new editor size type.
     */
    public function store(AdminEditorSizeTypeStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $category = $this->editorSizeTypeService->createCategory($request->user(), $data);

            return response()->json([
                'success' => true,
                'message' => '편집기 크기 유형이 성공적으로 생성되었습니다.',
                'data' => ['category' => $category],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Update an editor size type.
     */
    public function update(AdminEditorSizeTypeUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $category = $this->editorSizeTypeService->updateCategory($id, $data);

            return response()->json([
                'success' => true,
                'message' => '편집기 크기 유형이 성공적으로 수정되었습니다.',
                'data' => ['category' => $category],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Delete an editor size type.
     */
    public function destroy(int $id): JsonResponse
    {
        $this->editorSizeTypeService->deleteCategory($id);

        return response()->json([
            'success' => true,
            'message' => '편집기 크기 유형이 성공적으로 삭제되었습니다.',
        ]);
    }

    /**
     * Reorder editor size types.
     */
    public function reorder(AdminEditorSizeTypeReorderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $this->editorSizeTypeService->updateSortOrder($data['categories']);

        return response()->json([
            'success' => true,
            'message' => '편집기 크기 유형 순서가 성공적으로 변경되었습니다.',
        ]);
    }
}
