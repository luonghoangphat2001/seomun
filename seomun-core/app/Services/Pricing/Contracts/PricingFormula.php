<?php

namespace App\Services\Pricing\Contracts;

use App\Services\Pricing\DTO\PricingContext;
use App\Services\Pricing\DTO\PricingResult;

interface PricingFormula
{
    public function calculate(int $productId, array $selectedOptions, int $quantity, int $case): int;
}