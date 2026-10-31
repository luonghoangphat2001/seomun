<?php

namespace App\Services;

use App\Services\Hanjin\HanjinApiClient;
use App\Services\Hanjin\HanjinTrackingResult;

class HanjinService
{
    public function __construct(
        protected HanjinApiClient $hanjinApiClient
    ) {}

    public function getTracking(string $invoiceNumber): HanjinTrackingResult
    {
        return $this->hanjinApiClient->getTracking($invoiceNumber);
    }

    public function formatTrackingResponse(HanjinTrackingResult $result): array
    {
        if ($result->isError()) {
            return [
                'success' => false,
                'message' => $result->resultMessage ?? '배송 조회 정보를 찾을 수 없습니다.',
                'data' => [
                    'tracking_number' => $result->invoiceNumber,
                ],
                'meta' => [
                    'errorCode' => $result->resultCode,
                ],
            ];
        }

        return [
            'success' => true,
            'message' => '배송 정보를 성공적으로 조회했습니다.',
            'data' => [
                'tracking_number' => $result->invoiceNumber,
                'latestStatus' => [
                    'code' => $result->latestStatusCode,
                    'name' => $result->latestStatusName,
                    'timestamp' => $result->latestStatusAt?->format('Y-m-d H:i:s'),
                ],
                'history' => $result->history,
            ],
            'meta' => [],
        ];
    }
}
