<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PopupResource;
use App\Services\PaginationService;
use App\Services\PopupService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PopupController extends BaseController
{
    public function __construct(
        protected PopupService $popupService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get active/visible popups (Public / User).
     * Returns active popups for FE to display and categorize.
     * Supports optional query filtering (e.g. exposure_location) and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $result = $this->popupService->getPopups($request->user(), $request->all());

            if ($result instanceof LengthAwarePaginator) {
                return $this->responsePaginatedSuccess(200, '팝업 목록이 성공적으로 조회되었습니다.', [
                    'popups' => PopupResource::collection($result->items()),
                ], $this->paginationService->format($result));
            }

            return $this->responseSuccess(200, '팝업 목록이 성공적으로 조회되었습니다.', [
                'popups' => PopupResource::collection($result),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
