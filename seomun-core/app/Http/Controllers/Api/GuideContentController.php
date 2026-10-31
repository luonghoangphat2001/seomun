<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GuideContentResource;
use App\Models\GuideContent;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuideContentController extends Controller
{
    protected PaginationService $paginationService;

    public function __construct(PaginationService $paginationService)
    {
        $this->paginationService = $paginationService;
    }

    /**
     * Get all active guide contents (Public)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $type = $request->input('type');
            $perPage = min((int) $request->input('per_page', 15), 100);

            $query = GuideContent::active()
                ->published();

            if ($type) {
                $type = array_filter(explode(',', $type));
                $query->whereIn('type', $type);
            }

            $guides = $query->orderByDesc('published_at')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'guide_contents' => GuideContentResource::collection($guides->items()),
                ],
                'pagination' => $this->paginationService->format($guides),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '안내 목록을 불러오는 중 오류가 발생했습니다.',
            ], 500);
        }
    }

    /**
     * Get a specific guide content
     */
    public function show(int $id): JsonResponse
    {
        try {
            $guide = GuideContent::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'guide_content' => new GuideContentResource($guide),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '안내를 찾을 수 없습니다.',
            ], 404);
        }
    }
}
