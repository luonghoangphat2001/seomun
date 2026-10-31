<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notice\StoreNoticeRequest;
use App\Http\Requests\Notice\UpdateNoticeRequest;
use App\Http\Resources\NoticeResource;
use App\Models\Notice;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoticeController extends Controller
{
    protected PaginationService $paginationService;

    public function __construct(PaginationService $paginationService)
    {
        $this->paginationService = $paginationService;
    }

    /**
     * Get all active notices (Public)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $type = $request->input('type');
            $title = $request->input('title');
            $perPage = (int) $request->input('per_page', 15);
            $excludeIds = $request->input('exclude_ids');

            $query = Notice::active()->published();

            if ($type) {
                $query->ofType($type);
            }

            if ($title) {
                $query->where('title', 'like', "%{$title}%");
            }

            if ($excludeIds) {
                $ids = array_filter(explode(',', $excludeIds), fn($id) => is_numeric($id));
                if (!empty($ids)) {
                    $query->whereNotIn('id', $ids);
                }
            }

            // Order: pinned first, then by published_at desc
            $notices = $query->orderBy('is_pinned', 'desc')
                ->orderByRaw('COALESCE(published_at, created_at) DESC')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'notices' => NoticeResource::collection($notices->items()),
                ],
                'pagination' => $this->paginationService->format($notices),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '공지사항 목록을 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all notices including inactive (Admin)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $type = $request->input('type');
            $title = $request->input('title');
            $isActive = $request->input('is_active');
            $perPage = (int) $request->input('per_page', 15);
            $excludeIds = $request->input('exclude_ids');

            $query = Notice::query();

            if ($type) {
                $query->ofType($type);
            }

            if ($title) {
                $query->where('title', 'like', "%{$title}%");
            }

            if ($isActive !== null) {
                $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
            }

            if ($excludeIds) {
                $ids = array_filter(explode(',', $excludeIds), fn($id) => is_numeric($id));
                if (!empty($ids)) {
                    $query->whereNotIn('id', $ids);
                }
            }

            $notices = $query->orderBy('is_pinned', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'notices' => NoticeResource::collection($notices->items()),
                    'pagination' => $this->paginationService->format($notices),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '공지사항 목록을 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific notice
     */
    public function show(int $id): JsonResponse
    {
        try {
            $notice = Notice::findOrFail($id);

            // Increment view count
            $notice->incrementViewCount();

            return response()->json([
                'success' => true,
                'data' => [
                    'notice' => new NoticeResource($notice),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '공지사항을 찾을 수 없습니다.',
            ], 404);
        }
    }

    /**
     * Create a new notice
     */
    public function store(StoreNoticeRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $notice = Notice::create($validated);

            return response()->json([
                'success' => true,
                'message' => '공지사항이 생성되었습니다.',
                'data' => [
                    'notice' => new NoticeResource($notice),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '공지사항 생성 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a notice
     */
    public function update(UpdateNoticeRequest $request, int $id): JsonResponse
    {
        try {
            $notice = Notice::findOrFail($id);
            $validated = $request->validated();

            $notice->update($validated);

            return response()->json([
                'success' => true,
                'message' => '공지사항이 수정되었습니다.',
                'data' => [
                    'notice' => new NoticeResource($notice->fresh()),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '공지사항 수정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a notice
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $notice = Notice::findOrFail($id);
            $notice->delete();

            return response()->json([
                'success' => true,
                'message' => '공지사항이 삭제되었습니다.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '공지사항 삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
