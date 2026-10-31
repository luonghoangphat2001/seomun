<?php

namespace App\Services\Quote;

use App\Enums\ProductType;
use App\Models\UnitPrice;
use InvalidArgumentException;

class LargeFormatPrintingQuoteService
{
    public function calculate(
        int $erpSizeOptionId,
        int $width,
        int $height,
        int $subjectMatter,
        int $quantity,
        ProductType $productType,
    ): int {

        $unitPrice = UnitPrice::query()
            ->with('items')
            ->where('product_type', $productType)
            ->where('erp_size_option_id', $erpSizeOptionId)
            ->where('combination_options->subject_matter', $subjectMatter)
            ->where('is_active', true)
            ->first();

        if (!$unitPrice) {
            throw new InvalidArgumentException("Not found Unit Price");
        }

        $item = $unitPrice->items
            ->where('quantity_min', '<=', 1)
            ->sortByDesc('quantity_min')
            ->first();

        if (!$item) {
            throw new InvalidArgumentException("Quantity {$quantity} is not supported.");
        }

        return (int) $item->price_value * $quantity;
    }
}
