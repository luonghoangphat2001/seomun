<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HomeSection\StoreHomeSectionRequest;
use App\Http\Requests\HomeSection\UpdateHomeSectionRequest;
use App\Http\Resources\HomeSectionResource;
use App\Models\HomeSection;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeSectionController extends Controller
{
    protected PaginationService $paginationService;

    public function __construct(PaginationService $paginationService)
    {
        $this->paginationService = $paginationService;
    }

    /**
     * Get all active home sections (Public)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $type = $request->input('type');
            $perPage = (int) $request->input('per_page', 15);

            $query = HomeSection::active()->ordered();

            if ($type) {
                $query->ofType($type);
            }

            $sections = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'sections' => HomeSectionResource::collection($sections->items()),
                ],
                'pagination' => $this->paginationService->format($sections),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '홈 섹션 목록을 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all home sections including inactive (Admin)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $type = $request->input('type');
            $isActive = $request->input('is_active');
            $perPage = (int) $request->input('per_page', 15);

            $query = HomeSection::ordered();

            if ($type) {
                $query->ofType($type);
            }

            if ($isActive !== null) {
                $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
            }

            $sections = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'sections' => HomeSectionResource::collection($sections->items()),
                    'pagination' => $this->paginationService->format($sections),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '홈 섹션 목록을 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific home section
     */
    public function show(int $id): JsonResponse
    {
        try {
            $section = HomeSection::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'section' => new HomeSectionResource($section),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '홈 섹션을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '홈 섹션을 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new home section (Admin)
     */
    public function store(StoreHomeSectionRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            // Parse JSON fields if they are strings
            if (isset($validated['content']) && is_string($validated['content'])) {
                $validated['content'] = json_decode($validated['content'], true);
            }
            if (isset($validated['metadata']) && is_string($validated['metadata'])) {
                $validated['metadata'] = json_decode($validated['metadata'], true);
            }

            $section = HomeSection::create($validated);

            return response()->json([
                'success' => true,
                'message' => '홈 섹션이 생성되었습니다.',
                'data' => [
                    'section' => new HomeSectionResource($section),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '홈 섹션 생성 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a home section (Admin)
     */
    public function update(UpdateHomeSectionRequest $request, int $id): JsonResponse
    {
        try {
            $section = HomeSection::findOrFail($id);
            $validated = $request->validated();

            // Parse JSON fields if they are strings
            if (isset($validated['content']) && is_string($validated['content'])) {
                $validated['content'] = json_decode($validated['content'], true);
            }
            if (isset($validated['metadata']) && is_string($validated['metadata'])) {
                $validated['metadata'] = json_decode($validated['metadata'], true);
            }

            $section->update($validated);

            return response()->json([
                'success' => true,
                'message' => '홈 섹션이 수정되었습니다.',
                'data' => [
                    'section' => new HomeSectionResource($section->fresh()),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '홈 섹션을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '홈 섹션 수정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a home section (Admin)
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $section = HomeSection::findOrFail($id);
            $section->delete();

            return response()->json([
                'success' => true,
                'message' => '홈 섹션이 삭제되었습니다.',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '홈 섹션을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '홈 섹션 삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
