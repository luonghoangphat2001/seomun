<?php

namespace App\Services\Pricing\Formulas;

use App\Enums\ErpOptionGroupCode;
use App\Models\ErpOption;
use App\Models\Product;
use App\Services\Pricing\Contracts\PricingFormula;
use App\Services\Quote\BaseQuoteService;

class UnitTierPricingFormula implements PricingFormula
{
    public function __construct(private readonly BaseQuoteService $baseQuoteService) {}

    public function calculate(int $productId, array $selectedOptions, int $quantity, int $case): int
    {
        return $this->baseQuoteService->calculate(
            $productId,
            $selectedOptions[ErpOptionGroupCode::PAPER->value] ?? null,
            $selectedOptions[ErpOptionGroupCode::SIZE->value] ?? null,
            $selectedOptions[ErpOptionGroupCode::SUBJECT_MATTER->value] ?? null,
            (int) ($selectedOptions['width'] ?? 0),
            (int) ($selectedOptions['height'] ?? 0),
            $quantity,
            selectedOptions: $selectedOptions,
        );
    }
}
