<?php

namespace App\Services\Quote;

use App\Models\UnitPrice;
use InvalidArgumentException;

class TableSettingPaperQuoteService
{
    function calculate(
        int $erpSizeOptionId,
        int $quantity
    ): int {
        $unitPrice = UnitPrice::query()
            ->with('items')
            ->where('product_type', 'table_setting_paper')
            ->where('erp_size_option_id', $erpSizeOptionId)
            ->where('is_active', true)
            ->first();

        if (!$unitPrice) {
            throw new InvalidArgumentException("Not found: {$erpSizeOptionId}");
        }

        $item = $unitPrice->items
            ->where('quantity_min', '>=', $quantity)
            ->sortBy('quantity_min')
            ->first();

        if (!$item) {
            $item = $unitPrice->items->sortByDesc('quantity_min')->first();
        }

        return (int) $item->price_value;
    }
}
