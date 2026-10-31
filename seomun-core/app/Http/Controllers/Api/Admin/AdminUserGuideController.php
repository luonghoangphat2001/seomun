<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\UserGuide\StoreUserGuideRequest;
use App\Http\Requests\Admin\UserGuide\UpdateUserGuideRequest;
use App\Http\Requests\Admin\UserGuide\UserGuideListRequest;
use App\Http\Resources\Admin\AdminUserGuideResource;
use App\Models\UserGuide;
use App\Services\Admin\AdminUserGuideService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminUserGuideController extends BaseController
{
    public function __construct(
        protected AdminUserGuideService $adminUserGuideService,
        protected PaginationService $paginationService
    ) {}

    public function index(UserGuideListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $data = $this->adminUserGuideService->getUserGuides($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '사용자 가이드 목록이 성공적으로 조회되었습니다.', [
                'data' => AdminUserGuideResource::collection($data->items()),
            ], $this->paginationService->format($data));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $data = $this->adminUserGuideService->getUserGuide($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => new AdminUserGuideResource($data),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function store(StoreUserGuideRequest $request): JsonResponse
    {
        try {
            $guide = $this->adminUserGuideService->create($request->validated(), $request->user());

            return response()->json([
                'success' => true,
                'message' => '이용안내가 성공적으로 생성되었습니다.',
                'data' => [
                    'data' => new AdminUserGuideResource($guide),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '이용안내 생성 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(
        UpdateUserGuideRequest $request,
        int|string $id
    ): JsonResponse {
        try {
            $data = UserGuide::findOrFail($id);
            $guide = $this->adminUserGuideService->update($data, $request->validated(), $request->user());

            return response()->json([
                'success' => true,
                'message' => '이용안내가 성공적으로 수정되었습니다.',
                'data' => [
                    // Do not call `fresh()` without reloading relations:
                    // AdminUserGuideResource uses `whenLoaded('products')` so FE may think "no change"
                    // if products relationship isn't present in this response payload.
                    'data' => new AdminUserGuideResource($guide->fresh(['products'])),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '이용안내 수정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int|string $id): JsonResponse
    {
        try {
            $data = UserGuide::findOrFail($id);

            if ($data->attached_file) {
                Storage::disk('public')->delete($data->attached_file);
            }

            $data->delete();

            return response()->json([
                'success' => true,
                'message' => '이용안내가 성공적으로 삭제되었습니다.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '이용안내 삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
