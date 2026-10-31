<?php

namespace App\Services\Quote;

use App\Models\UnitPrice;
use InvalidArgumentException;

class LHolderQuoteService
{
    public function calculate(
        int $erpPaperOptionId,
        string $printing,
        int $quantity
    ): ?int {
        $unitPrice = UnitPrice::query()
            ->with('items')
            ->where('erp_paper_option_id', $erpPaperOptionId)
            ->where('product_type', 'l_holder')
            ->where('combination_options->printing', $printing)
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
