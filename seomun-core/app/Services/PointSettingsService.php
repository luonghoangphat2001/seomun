<?php

namespace App\Services;

use App\Models\PointSetting;

class PointSettingsService
{
    public function getSettings(): PointSetting
    {
        return PointSetting::getOrCreate();
    }

    public function updateSettings(array $data): PointSetting
    {
        $settings = PointSetting::getOrCreate();
        $settings->update($data);

        return $settings;
    }

    public function canUsePoints(int $orderAmount): bool
    {
        $setting = $this->getSettings();

        // not enable restriction
        if (! $setting->enable_payment_restriction) {
            return true;
        }

        // reach min order
        if (
            $setting->min_order_amount_to_use > 0
            && $orderAmount < $setting->min_order_amount_to_use
        ) {
            return false;
        }

        return true;
    }

    public function calculateMaxUsablePoints(int $orderAmount): int
    {
        $setting = $this->getSettings();

        // LIMIT BY PERCENT
        $percentLimit = PHP_INT_MAX;

        if ($setting->max_point_usage_percent !== null) {
            $percent = max(0, min(100, $setting->max_point_usage_percent));

            $percentLimit = (int) floor($orderAmount * $percent / 100);
        }

        // LIMIT BY AMOUNT
        $amountLimit = $setting->max_point_usage_amount ?? PHP_INT_MAX;

        // FINAL LIMIT
        $maxUsable = min($percentLimit, $amountLimit);

        return max(0, $maxUsable);
    }
}
