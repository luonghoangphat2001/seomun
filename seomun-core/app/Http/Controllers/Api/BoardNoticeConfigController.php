<?php

namespace App\Http\Controllers\Api;

use App\Models\BoardNoticeConfig;
use Illuminate\Http\JsonResponse;

class BoardNoticeConfigController extends BaseController
{
    /**
     * GET /api/board-notice-configs/{boardType}
     * Get active notice for a specific board page (public).
     */
    public function show(string $boardType): JsonResponse
    {
        $config = BoardNoticeConfig::where('board_type', $boardType)->first();

        $enabled = $config?->notice_enabled ?? false;

        return response()->json([
            'success' => true,
            'data' => [
                'board_type'      => $boardType,
                'notice_enabled'  => $enabled,
                'notice_message'  => $enabled ? ($config->notice_message ?? null) : null,
            ],
        ]);
    }
}
