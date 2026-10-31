<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\DirectShippingStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\DirectShipping\AdminDirectShippingListRequest;
use App\Http\Resources\Admin\AdminDirectShippingResource;
use App\Services\Admin\AdminDirectShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class AdminDirectShippingController extends BaseController
{
    public function __construct(
        protected AdminDirectShippingService $service
    ) {}

    /**
     * Get search filters for direct shipping.
     */
    public function searchFilters(): JsonResponse
    {
        return $this->responseSuccess(200, '직배송 검색 필터가 조회되었습니다.', [
            'statuses' => $this->service->getStatusOptions(),
        ]);
    }

    /**
     * Get a single direct shipping request.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $item = $this->service->getOne($id);

            return $this->responseSuccess(200, '직배송 신청 상세 정보가 조회되었습니다.', [
                'item' => new AdminDirectShippingResource($item),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->responseError(404, '해당 직배송 신청을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            return $this->responseError(500, '상세 정보 조회 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * Get direct shipping requests list for admin.
     */
    public function index(AdminDirectShippingListRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 20);

        $result = $this->service->getList($filters, $perPage);

        return $this->responsePaginatedSuccess(200, '직배송 신청 목록이 조회되었습니다.', [
            'items' => AdminDirectShippingResource::collection($result['items'])
        ], $result['pagination']);
    }

    /**
     * Update direct shipping status.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', new Enum(DirectShippingStatus::class)],
        ]);

        try {
            $status = DirectShippingStatus::from($validated['status']);
            $item = $this->service->updateStatus($id, $status);

            return $this->responseSuccess(200, '상태가 변경되었습니다.', [
                'item' => new AdminDirectShippingResource($item),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->responseError(404, '해당 직배송 신청을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            return $this->responseError(500, '상태 변경 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }
}