<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Services\MyPage\MypageLimitManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LimitManagementController extends BaseController
{
    public function __construct(public MypageLimitManagementService $mypageLimitManagementService) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $this->mypageLimitManagementService->getLimit($user);

            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', [$data]);
        } catch (\Exception $e) {
            Log::error('Get MyPage limit failed', [
                'user_id' => $user->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '한도 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * get LimitHistory
     *
     * @return JsonResponse
     */
    public function history(Request $request)
    {
        try {
            $user = $request->user();
            $data = $this->mypageLimitManagementService->getLimitHistory($user);

            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', $data);
        } catch (\Exception $e) {
            Log::error('Get MyPage history failed', [
                'user_id' => $user->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '한도 이력을 불러오는 중 오류가 발생했습니다.');
        }
    }
}
