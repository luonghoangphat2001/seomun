<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Color\AdminCreateColorRequest;
use App\Http\Requests\Admin\Color\AdminUpdateColorRequest;
use App\Services\Admin\AdminColorService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminColorController extends Controller
{
    public function __construct(
        protected AdminColorService $adminColorService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $search = $request->input('search');

            $data = $this->adminColorService->getColors($user, $search);

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get Color failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '색상 목록을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(AdminCreateColorRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $color = $this->adminColorService->createColor($user, $validated);

            return response()->json([
                'success' => true,
                'data' => $color,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create color failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '색상 생성 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(AdminUpdateColorRequest $request, string $id)
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $color = $this->adminColorService->updateColor($user, $id, $validated);

            return response()->json([
                'success' => true,
                'message' => '색상이 성공적으로 업데이트되었습니다.',
                'data' => $color,
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '색상을 찾을 수 없습니다.',
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
            $this->adminColorService->deleteColor($user, $id);

            return response()->json([
                'success' => true,
                'message' => '색상이 성공적으로 삭제되었습니다.',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '색상을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Delete Color failed', [
                'user_id' => $request->user()->id ?? null,
                'store_permission_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '색상 삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
