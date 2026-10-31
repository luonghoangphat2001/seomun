<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\EditorSize\AdminEditorSizeListRequest;
use App\Http\Requests\Admin\EditorSize\AdminEditorSizeStoreRequest;
use App\Http\Requests\Admin\EditorSize\AdminEditorSizeUpdateRequest;
use App\Services\Admin\AdminEditorSizeService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminEditorSizeController extends BaseController
{
    public function __construct(
        protected AdminEditorSizeService $editorSizeService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get list of editor sizes with filters and pagination.
     */
    public function index(AdminEditorSizeListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $sizes = $this->editorSizeService->getCategories($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '편집기 크기 목록이 성공적으로 조회되었습니다.', [
                'sizes' => $sizes->items(),
            ], $this->paginationService->format($sizes));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get a single editor size by ID.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $size = $this->editorSizeService->getSize($id);

            return response()->json([
                'success' => true,
                'data' => ['size' => $size],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Store a new editor size.
     */
    public function store(AdminEditorSizeStoreRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Convert status string to is_active boolean
        if (isset($data['is_active'])) {
            $data['is_active'] = $data['is_active'] === 'active';
            unset($data['status']);
        }

        $size = $this->editorSizeService->createSize($request->user(), $data);

        return response()->json([
            'success' => true,
            'message' => '에디터 크기가 성공적으로 생성되었습니다.',
            'data' => ['size' => $size],
        ], 201);
    }

    /**
     * Update an editor size.
     */
    public function update(AdminEditorSizeUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            // Convert status string to is_active boolean
            if (isset($data['is_active'])) {
                $data['is_active'] = $data['is_active'] === 'active';
                unset($data['status']);
            }

            $size = $this->editorSizeService->updateSize($id, $data);

            return response()->json([
                'success' => true,
                'message' => '에디터 크기가 성공적으로 수정되었습니다.',
                'data' => ['size' => $size],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 201);
        }
    }

    /**
     * Delete an editor size.
     */
    public function destroy(int $id): JsonResponse
    {
        $this->editorSizeService->deleteSize($id);

        return response()->json([
            'success' => true,
            'message' => '에디터 크기가 성공적으로 삭제되었습니다.',
        ]);
    }
}
