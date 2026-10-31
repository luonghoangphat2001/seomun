<?php

namespace App\Services\Pricing\Formulas;

use App\Enums\ErpOptionGroupCode;
use App\Enums\PriceType;
use App\Models\ErpOption;
use App\Services\Pricing\Contracts\PricingFormula;
use App\Services\Quote\BaseQuoteService;

class StickerPricingFormula implements PricingFormula
{
    public function __construct(
        protected BaseQuoteService $baseQuoteService,
    ) {}

    public function calculate(int $productId, array $selectedOptions, int $quantity, int $case): int
    {
        $widthMeter = $selectedOptions['width'];
        $heightMeter = $selectedOptions['height'];

        $sizeOption = ! empty($selectedOptions[ErpOptionGroupCode::SIZE->value])
            ? ErpOption::find($selectedOptions[ErpOptionGroupCode::SIZE->value])
            : null;

        $paperOption = ! empty($selectedOptions[ErpOptionGroupCode::PAPER->value])
            ? ErpOption::find($selectedOptions[ErpOptionGroupCode::PAPER->value])
            : null;

        if ($sizeOption == null || $widthMeter != $sizeOption->size->cutting_width || $heightMeter != $sizeOption->size->cutting_height) {
            $unitPrice = $this->baseQuoteService->calculate($productId, $paperOption?->id, null, null, $selectedOptions['width'], $selectedOptions['height'], $quantity, PriceType::SUPPLY, false);
            if ($unitPrice == 0) {
                $unitPrice = $this->baseQuoteService->calculate($productId, $paperOption?->id, $sizeOption?->id, null, $selectedOptions['width'], $selectedOptions['height'], $quantity);
            }
        } else {
            $unitPrice = $this->baseQuoteService->calculate($productId, $paperOption?->id, $sizeOption?->id, null, $selectedOptions['width'], $selectedOptions['height'], $quantity);
        }

        $totalPrice = $unitPrice * $case;

        return $totalPrice;
    }
}
