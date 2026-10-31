<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MyPage\UpdateQuickMenuRequest;
use App\Services\MyPage\MyPageQuickMenuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class QuickMenuController extends BaseController
{
    public function __construct(
        protected MyPageQuickMenuService $quickMenuService
    ) {}

    /**
     * GET /api/mypage/quick-menu
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $items = $this->quickMenuService->getQuickMenu($request->user());

            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', ['items' => $items]);
        } catch (\Throwable $e) {
            Log::error('Get MyPage quick menu failed', [
                'user_id' => $request->user()->id ?? null,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '퀵 메뉴 설정을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * GET /api/mypage/quick-menu/options
     */
    public function options(Request $request): JsonResponse
    {
        try {
            $options = $this->quickMenuService->getAvailableMenuOptions();

            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', $options);
        } catch (\Throwable $e) {
            Log::error('Get quick menu options failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '메뉴 옵션을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * PUT /api/mypage/quick-menu
     */
    public function update(UpdateQuickMenuRequest $request): JsonResponse
    {
        try {
            $items = $this->quickMenuService->updateQuickMenu($request->user(), $request->validated()['items']);

            return $this->responseSuccess(200, '퀵 메뉴 설정이 저장되었습니다.', ['items' => $items]);
        } catch (\Throwable $e) {
            Log::error('Update MyPage quick menu failed', [
                'user_id' => $request->user()->id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '퀵 메뉴 설정 저장 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }
}
