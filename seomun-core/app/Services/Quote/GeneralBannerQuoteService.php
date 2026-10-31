<?php

namespace App\Services\Quote;

use App\Models\UnitPrice;
use InvalidArgumentException;

class GeneralBannerQuoteService
{
    public function calculate(
        int $width,
        int $height,
        int $quantity,
    ): ?int {

        $unitPrice = UnitPrice::query()
            ->with('items')
            ->where('product_type', 'general_banner')
            ->where('combination_options->width', $width)
            ->where('combination_options->height', $height)
            ->where('is_active', true)
            ->first();

        if (!$unitPrice) {
            return null;
        }

        $item = $unitPrice->items
            ->where('quantity_min', '<=', 1)
            ->sortByDesc('quantity_min')
            ->first();

        if (!$item) {
            return null;
        }

        return (int) $item->price_value * $quantity;
    }
}
