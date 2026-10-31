<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\PointSettings\UpdatePointSettingsRequest;
use App\Http\Resources\Admin\AdminPointSettingResource;
use App\Services\PointSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminPointSettingsController extends BaseController
{
    public function __construct(
        protected PointSettingsService $settingsService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $settings = $this->settingsService->getSettings();

            return $this->responseSuccess(200, '포인트 설정 조회 성공', new AdminPointSettingResource($settings));
        } catch (\Exception $e) {
            Log::error('Get point settings failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '포인트 설정 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    public function update(UpdatePointSettingsRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $settings = $this->settingsService->updateSettings($validated);

            return $this->responseSuccess(200, '포인트 설정이 성공적으로 업데이트되었습니다.', new AdminPointSettingResource($settings));
        } catch (\Exception $e) {
            Log::error('Update point settings failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '포인트 설정 업데이트 중 오류가 발생했습니다.', $e->getMessage());
        }
    }
}
