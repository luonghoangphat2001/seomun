<?php

namespace App\Http\Controllers\Api;

use App\Services\HanjinService;
use App\Services\Hanjin\HanjinTrackingResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HanjinController extends BaseController
{
    public function __construct(
        protected HanjinService $hanjinService
    ) {}

    public function tracking(Request $request): JsonResponse
    {
        $request->validate([
            'invoice_number' => 'required|string',
        ]);

        try {
            $result = $this->hanjinService->getTracking($request->input('invoice_number'));
            $formattedResponse = $this->hanjinService->formatTrackingResponse($result);

            return $this->responseSuccess(
                $formattedResponse['success'] ? 200 : 404,
                $formattedResponse['message'],
                $formattedResponse['data']
            );
        } catch (\Throwable $e) {
            return $this->responseError(500, '배송 추적 정보를 불러오는 중 오류가 발생했습니다: ' . $e->getMessage());
        }
    }
}
