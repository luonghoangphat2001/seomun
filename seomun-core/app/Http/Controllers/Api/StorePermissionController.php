<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserPermission\CreateStorePermissionRequest;
use App\Http\Requests\UserPermission\UpdateStorePermissionRequest;
use App\Services\StorePermissionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StorePermissionController extends Controller
{
    public function __construct(
        protected StorePermissionService $storePermissionService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $search = $request->input('search');
            $searchOption = $request->input('search_option', 'permission_name');
            $perPage = (int) $request->input('per_page', 15);

            $data = $this->storePermissionService->getStorePermissions($user, $search, $searchOption, $perPage);

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get StorePermission failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '스토어 권한 목록을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateStorePermissionRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $storePermission = $this->storePermissionService->createStorePermission($user, $validated);

            return response()->json([
                'success' => true,
                'message' => '스토어 권한이 성공적으로 등록되었습니다.',
                'data' => $storePermission,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create store permission failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '스토어 권한 등록 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        try {
            $user = $request->user();
            $storePermission = $this->storePermissionService->getStorePermissionDetail($user, $id);

            return response()->json([
                'success' => true,
                'data' => $storePermission,
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '스토어 권한을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Get StorePermission detail failed', [
                'user_id' => $request->user()->id ?? null,
                'store_permission_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '스토어 권한 세부 정보를 가져오는 동안 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStorePermissionRequest $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $storePermission = $this->storePermissionService->updateStorePermission($user, $id, $validated);

            return response()->json([
                'success' => true,
                'message' => '스토어 권한이 성공적으로 수정되었습니다.',
                'data' => $storePermission,
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '스토어 권한을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            $this->storePermissionService->deleteStorePermission($user, $id);

            return response()->json([
                'success' => true,
                'message' => '스토어 권한이 성공적으로 삭제되었습니다.',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '스토어 권한을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Get StorePermission detail failed', [
                'user_id' => $request->user()->id ?? null,
                'store_permission_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '스토어 권한을 삭제하는 동안 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
