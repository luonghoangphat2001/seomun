<?php

namespace App\Services;

use App\Models\UnitPrice;

class UnitPriceService
{
    public function getPriceValue(
        int $erpOptionId,
        int $quantity
    ): ?string {

        $unitPrice = UnitPrice::query()
            ->where('erp_option_id', $erpOptionId)
            ->where('is_active', true)
            ->with(['items' => function ($query) use ($quantity) {
                $query->where('quantity_min', '<=', $quantity)
                    ->orderByDesc('quantity_min');
            }])
            ->first();

        if (!$unitPrice) {
            return "0";
        }

        $matchedItem = $unitPrice->items->first();

        return $matchedItem?->price_value;
    }
}
