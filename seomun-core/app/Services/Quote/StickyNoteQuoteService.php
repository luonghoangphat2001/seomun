<?php

namespace App\Services\Quote;

use App\Models\UnitPrice;
use App\Models\UnitPriceItem;
use InvalidArgumentException;

class StickyNoteQuoteService
{
    public function calculate(
        int $erpSizeOptionId,
        int $width,
        int $height,
        int $quantity,
    ): ?int {

        $unitPrice = UnitPrice::query()
            ->with('items')
            ->where('product_type', 'sticky_note')
            ->where('erp_size_option_id', $erpSizeOptionId)
            ->where('is_active', true)
            ->first();

        if (!$unitPrice) {
            return null;
        }

        $item = $unitPrice->items
            ->where('quantity_min', '<=', $quantity)
            ->sortByDesc('quantity_min')
            ->first();

        if (!$item) {
            $item = $unitPrice->items->sortBy('quantity_min')->first();
        }

        return (int) $item->price_value;
    }
}
