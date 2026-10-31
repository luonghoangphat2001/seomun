<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\ShippingSetting\UpdateShippingSettingRequest;
use App\Models\ShippingSetting;
use Illuminate\Http\JsonResponse;

class AdminShippingSettingController extends BaseController
{
    /**
     * Get the current shipping settings (free shipping date range).
     */
    public function show(): JsonResponse
    {
        try {
            $setting = ShippingSetting::first();

            return $this->responseSuccess(200, '배송 설정 정보가 성공적으로 조회되었습니다.', [
                'free_shipping_start_at' => $setting?->free_shipping_start_at?->format('Y-m-d H:i:s'),
                'free_shipping_end_at' => $setting?->free_shipping_end_at?->format('Y-m-d H:i:s'),
                'is_active' => ShippingSetting::isFreeShippingActive(),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update the free shipping date range settings.
     */
    public function update(UpdateShippingSettingRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $setting = ShippingSetting::first();
            if (! $setting) {
                $setting = ShippingSetting::create($validated);
            } else {
                $setting->update($validated);
            }

            return $this->responseSuccess(200, '배송 설정이 성공적으로 수정되었습니다.', [
                'free_shipping_start_at' => $setting->free_shipping_start_at?->format('Y-m-d H:i:s'),
                'free_shipping_end_at' => $setting->free_shipping_end_at?->format('Y-m-d H:i:s'),
                'is_active' => ShippingSetting::isFreeShippingActive(),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
