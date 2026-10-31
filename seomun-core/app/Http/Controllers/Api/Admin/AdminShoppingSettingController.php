<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\ShoppingSetting\StoreShoppingSettingRequest;
use App\Http\Requests\Admin\ShoppingSetting\UpdateShoppingSettingRequest;
use App\Http\Resources\Admin\AdminShoppingSettingResource;
use App\Services\Admin\ShoppingSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AdminShoppingSettingController extends BaseController
{
    public function __construct(
        protected ShoppingSettingService $shoppingSettingService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $settings = $this->shoppingSettingService->getAllShoppingSettings();

            return $this->responseSuccess(200, '쇼핑 설정 목록 조회 성공', [
                'settings' => AdminShoppingSettingResource::collection($settings),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve shopping settings', [
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '쇼핑 설정 목록 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreShoppingSettingRequest $request): JsonResponse
    {
        try {
            $setting = $this->shoppingSettingService->createShoppingSetting($request->validated());

            return $this->responseSuccess(201, '쇼핑 설정이 생성되었습니다.', new AdminShoppingSettingResource($setting));
        } catch (\Exception $e) {
            Log::error('Failed to create shopping setting', [
                'error' => $e->getMessage(),
            ]);

            $statusCode = $e->getCode() === 422 ? 422 : 500;

            return $this->responseError($statusCode, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $setting = $this->shoppingSettingService->getShoppingSettingById($id);

            if (! $setting) {
                return $this->responseError(404, '쇼핑 설정을 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '쇼핑 설정 조회 성공', new AdminShoppingSettingResource($setting));
        } catch (\Exception $e) {
            Log::error('Failed to retrieve shopping setting', [
                'setting_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '쇼핑 설정 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateShoppingSettingRequest $request, int $id): JsonResponse
    {
        try {
            $setting = $this->shoppingSettingService->updateShoppingSetting($id, $request->validated());

            if (! $setting) {
                return $this->responseError(404, '쇼핑 설정을 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '쇼핑 설정이 수정되었습니다.', new AdminShoppingSettingResource($setting));
        } catch (\Exception $e) {
            Log::error('Failed to update shopping setting', [
                'setting_id' => $id,
                'error' => $e->getMessage(),
            ]);

            $statusCode = $e->getCode() === 422 ? 422 : 500;

            return $this->responseError($statusCode, $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->shoppingSettingService->deleteShoppingSetting($id);

            if (! $deleted) {
                return $this->responseError(404, '쇼핑 설정을 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '쇼핑 설정이 삭제되었습니다.');
        } catch (\Exception $e) {
            Log::error('Failed to delete shopping setting', [
                'setting_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '쇼핑 설정 삭제 중 오류가 발생했습니다.', $e->getMessage());
        }
    }
}