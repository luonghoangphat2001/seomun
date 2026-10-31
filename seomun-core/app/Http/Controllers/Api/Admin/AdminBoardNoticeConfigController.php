<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Models\BoardNoticeConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBoardNoticeConfigController extends BaseController
{
    /**
     * GET /api/admin/board-notice-configs
     * List all board notice configs.
     */
    public function index(): JsonResponse
    {
        $configs = BoardNoticeConfig::orderBy('board_type')->get();

        return response()->json([
            'success' => true,
            'data' => ['configs' => $configs],
        ]);
    }

    /**
     * PUT /api/admin/board-notice-configs/{boardType}
     * Upsert notice config for a specific board type.
     */
    public function update(Request $request, string $boardType): JsonResponse
    {
        $request->validate([
            'notice_enabled' => 'required|boolean',
            'notice_message' => 'nullable|string|max:5000',
        ]);

        $config = BoardNoticeConfig::updateOrCreate(
            ['board_type' => $boardType],
            [
                'notice_enabled' => $request->boolean('notice_enabled'),
                'notice_message' => $request->input('notice_message'),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => '게시판 공지 설정이 성공적으로 수정되었습니다.',
            'data' => ['config' => $config],
        ]);
    }
}
