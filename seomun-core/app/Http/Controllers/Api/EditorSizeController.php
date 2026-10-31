<?php

namespace App\Http\Controllers\Api;

use App\Models\EditorSize;
use App\Services\EditorSizeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EditorSizeController extends BaseController
{
    public function __construct(
        protected EditorSizeService $editorSizeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $sizes = $this->editorSizeService->getList($request);

            return response()->json([
                'success' => true,
                'data' => [
                    'editor_sizes' => $sizes,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => '에디터 크기 목록을 불러오는 중 오류가 발생했습니다.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
