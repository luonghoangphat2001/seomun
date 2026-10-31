<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\ShoppingSettingItem\StoreShoppingSettingItemRequest;
use App\Http\Requests\Admin\ShoppingSettingItem\UpdateShoppingSettingItemRequest;
use App\Http\Resources\Admin\AdminShoppingSettingItemResource;
use App\Services\Admin\ShoppingSettingItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminShoppingSettingItemController extends BaseController
{
    public function __construct(
        protected ShoppingSettingItemService $itemService
    ) {}

    /**
     * Get items for a shopping setting.
     */
    public function index(Request $request, ?int $settingId = null): JsonResponse
    {
        try {
            $settingId = $settingId ?? $request->integer('shopping_setting_id');
            if (!$settingId) {
                return $this->responseError(422, 'shopping_setting_id is required.');
            }

            $onlyActive = $request->has('is_active') ? $request->boolean('is_active') : null;
            $items = $this->itemService->getItemsBySetting($settingId, $onlyActive);

            return $this->responseSuccess(200, '쇼핑 설정 항목 목록 조회 성공', [
                'items' => AdminShoppingSettingItemResource::collection($items),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to retrieve shopping setting items', [
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '쇼핑 설정 항목 목록 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    /**
     * Create a new shopping setting item.
     */
    public function store(StoreShoppingSettingItemRequest $request): JsonResponse
    {
        try {
            $item = $this->itemService->createItem($request->validated());

            return $this->responseSuccess(201, '쇼핑 설정 항목이 생성되었습니다.', new AdminShoppingSettingItemResource($item->load('setting')));
        } catch (\Throwable $e) {
            Log::error('Failed to create shopping setting item', [
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '쇼핑 설정 항목 생성 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    /**
     * Get single shopping setting item.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $item = $this->itemService->getItemById($id);
            if (!$item) {
                return $this->responseError(404, '쇼핑 설정 항목을 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '쇼핑 설정 항목 조회 성공', new AdminShoppingSettingItemResource($item));
        } catch (\Throwable $e) {
            Log::error('Failed to retrieve shopping setting item', [
                'item_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '쇼핑 설정 항목 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    /**
     * Update shopping setting item.
     */
    public function update(UpdateShoppingSettingItemRequest $request, int $id): JsonResponse
    {
        try {
            $item = $this->itemService->updateItem($id, $request->validated());
            if (!$item) {
                return $this->responseError(404, '쇼핑 설정 항목을 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '쇼핑 설정 항목이 수정되었습니다.', new AdminShoppingSettingItemResource($item));
        } catch (\Throwable $e) {
            Log::error('Failed to update shopping setting item', [
                'item_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '쇼핑 설정 항목 수정 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    /**
     * Delete shopping setting item.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->itemService->deleteItem($id);
            if (!$deleted) {
                return $this->responseError(404, '쇼핑 설정 항목을 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '쇼핑 설정 항목이 삭제되었습니다.');
        } catch (\Throwable $e) {
            Log::error('Failed to delete shopping setting item', [
                'item_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '쇼핑 설정 항목 삭제 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    /**
     * Set item as default for its setting.
     */
    public function setDefault(int $id): JsonResponse
    {
        try {
            $item = $this->itemService->setDefault($id);
            if (!$item) {
                return $this->responseError(404, '쇼핑 설정 항목을 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '기본 쇼핑 설정 항목으로 지정되었습니다.', new AdminShoppingSettingItemResource($item));
        } catch (\Throwable $e) {
            Log::error('Failed to set default shopping setting item', [
                'item_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '기본 항목 지정 중 오류가 발생했습니다.', $e->getMessage());
        }
    }
}
