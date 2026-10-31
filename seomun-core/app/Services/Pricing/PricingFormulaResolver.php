<?php

namespace App\Services\Pricing;

use App\Enums\PricingCalculatorType;
use App\Models\Product;
use App\Services\Pricing\Contracts\PricingFormula;
use App\Services\Pricing\Formulas\AreaUnitPricingFormula;
use App\Services\Pricing\Formulas\GenneralBannerPricingFormula;
use App\Services\Pricing\Formulas\PaperPrintPricingFormula;
use App\Services\Pricing\Formulas\UnitTierPricingFormula;

class PricingFormulaResolver
{
    public function resolve(Product $product): PricingFormula
    {
        $calculator = $product->pricingProfile?->calculator_type;
        if (! $calculator) {
            throw new \RuntimeException('상품에 Pricing Profile이 연결되어 있지 않습니다.');
        }

        return match ($calculator) {
            PricingCalculatorType::PAPER_PRINT => app(PaperPrintPricingFormula::class),
            PricingCalculatorType::UNIT_TIER => app(UnitTierPricingFormula::class),
            PricingCalculatorType::AREA_UNIT => app(AreaUnitPricingFormula::class),
            PricingCalculatorType::MATRIX => app(GenneralBannerPricingFormula::class),
        };
    }
}
