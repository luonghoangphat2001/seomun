<?php

namespace App\Services\Pricing\Formulas;

use App\Enums\ErpOptionGroupCode;
use App\Models\ErpOption;
use App\Services\Pricing\Contracts\PricingFormula;
use App\Services\Pricing\DTO\PricingContext;
use App\Services\Pricing\DTO\PricingResult;
use App\Services\Quote\BaseQuoteService;

class DefaultPricingFormula implements PricingFormula
{

    public function __construct(
        protected BaseQuoteService $baseQuoteService,
    ) {}
    public function calculate(int $productId, array $selectedOptions, int $quantity, int $case): int
    {
        $sizeOption = !empty($selectedOptions[ErpOptionGroupCode::SIZE->value])
            ? ErpOption::find($selectedOptions[ErpOptionGroupCode::SIZE->value])
            : null;

        $paperOption = !empty($selectedOptions[ErpOptionGroupCode::PAPER->value])
            ? ErpOption::find($selectedOptions[ErpOptionGroupCode::PAPER->value])
            : null;
        $erpSubjectMasterOptionId = $selectedOptions[ErpOptionGroupCode::SUBJECT_MATTER->value] ?? null;
        
        return $this->baseQuoteService->calculate($productId, $paperOption?->id, $sizeOption?->id, $erpSubjectMasterOptionId, $selectedOptions['width'], $selectedOptions['height'], $quantity) * $case;
    }
}
