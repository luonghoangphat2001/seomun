<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\Admin\ExportHistoriesResource;
use App\Models\ExportHistory;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class ExportHistoryController extends BaseController
{
    public function show(ExportHistory $exportHistory): JsonResponse
    {
        try {
            return $this->responseSuccess(200, '내보내기 기록이 성공적으로 조회되었습니다.', new ExportHistoriesResource($exportHistory));
        } catch (\Throwable $th) {
            if ($th instanceof ModelNotFoundException) {
                return $this->responseError(404, '내보내기 기록을 찾을 수 없습니다.', [$th->getMessage()]);
            }

            return $this->responseError(500, '내보내기 기록 조회에 실패하였습니다.', [$th->getMessage()]);
        }
    }
}
