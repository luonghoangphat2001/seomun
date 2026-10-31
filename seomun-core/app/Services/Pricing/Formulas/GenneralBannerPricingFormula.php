<?php

namespace App\Services\Pricing\Formulas;

use App\Services\Pricing\Contracts\PricingFormula;
use App\Services\Quote\BaseQuoteService;

class GenneralBannerPricingFormula implements PricingFormula
{
    public function __construct(
        protected BaseQuoteService $baseQuoteService,
    ) {}

    private const BASE_PRICES = [
        3 => 10300,
        4 => 10800,
        5 => 11300,
        6 => 11800,
        7 => 12300,
        8 => 12800,
        9 => 13800,
        10 => 14300,
        11 => 14800,
        12 => 15300,
        13 => 15800,
        14 => 16300,
        15 => 16800,
        16 => 17800,
        17 => 18300,
        18 => 18800,
    ];

    private const WIDTH_INCREASES = [
        3 => 1500,
        4 => 1500,
        5 => 1500,
        6 => 1500,
        7 => 1500,
        8 => 1500,
        9 => 1500,
        10 => 2000,
        11 => 2500,
        12 => 3000,
        13 => 3500,
        14 => 3500,
        15 => 4000,
        16 => 4500,
        17 => 4500,
        18 => 5000,
    ];

    public function calculate(int $productId, array $selectedOptions, int $quantity, int $case): int
    {
        $width = round($selectedOptions['width'] / 1000, 1);
        $length = round($selectedOptions['height'] / 1000, 1);

        $index = (int) ($length * 10);
        $basePrice = self::BASE_PRICES[$index];
        $widthIncrease = self::WIDTH_INCREASES[$index];
        $widthSteps = ($width - 1.0) / 0.5;

        return (int) ($basePrice + $widthSteps * $widthIncrease) * $quantity * $case;
    }
}
