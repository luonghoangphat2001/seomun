<?php

namespace App\Services\Quote;

use App\Models\UnitPrice;
use InvalidArgumentException;

class MasterEnvelopeQuoteService
{
    public function calculate(
        int $erpPaperOptionId,
        int $erpSizeOptionId,
        int $quantity,
    ): ?int {

        $unitPrice = UnitPrice::query()
            ->with('items')
            ->where('product_type', 'master_envelope')
            ->where('erp_paper_option_id', $erpPaperOptionId)
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
            return null;
        }

        return (int) $item->price_value;
    }
}