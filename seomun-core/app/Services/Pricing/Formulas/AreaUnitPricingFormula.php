<?php

namespace App\Services\Pricing\Formulas;

use App\Enums\ErpOptionGroupCode;
use App\Models\Product;
use App\Services\Pricing\Contracts\PricingFormula;
use App\Services\Quote\BaseQuoteService;

class AreaUnitPricingFormula implements PricingFormula
{
    public function __construct(private readonly BaseQuoteService $baseQuoteService) {}

    public function calculate(int $productId, array $selectedOptions, int $quantity, int $case): int
    {
        $rate = $this->baseQuoteService->calculate(
            $productId,
            $selectedOptions[ErpOptionGroupCode::PAPER->value] ?? null,
            $selectedOptions[ErpOptionGroupCode::SIZE->value] ?? null,
            $selectedOptions[ErpOptionGroupCode::SUBJECT_MATTER->value] ?? null,
            (int) ($selectedOptions['width'] ?? 0), (int) ($selectedOptions['height'] ?? 0), 1,
            selectedOptions: $selectedOptions,
        );
        $area = ((float) ($selectedOptions['width'] ?? 0) / 1000) * ((float) ($selectedOptions['height'] ?? 0) / 1000);
        return (int) round($area * $rate * $quantity);
    }
}
