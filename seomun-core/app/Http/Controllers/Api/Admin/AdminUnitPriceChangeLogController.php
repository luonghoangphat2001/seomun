<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Services\Admin\AdminUnitPriceChangeLogService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUnitPriceChangeLogController extends BaseController
{
    public function __construct(
        protected AdminUnitPriceChangeLogService $service,
        protected PaginationService $paginationService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'unit_price_item_id' => 'nullable|integer',
            'admin_id'           => 'nullable|integer',
            'date_from'          => 'nullable|date',
            'date_to'            => 'nullable|date',
            'per_page'           => 'nullable|integer|min:1|max:100',
        ]);

        try {
            $paginator = $this->service->getList(
                $request->only([
                    'unit_price_item_id',
                    'admin_id',
                    'date_from',
                    'date_to'
                ]),
                (int) $request->input('per_page', 20)
            );

            return $this->responsePaginatedSuccess(200, '단가 변경 로그 목록이 성공적으로 조회되었습니다.', [
                'items' => $paginator->items(),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
