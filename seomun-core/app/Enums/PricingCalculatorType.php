<?php

namespace App\Enums;

enum PricingCalculatorType: string
{
    case PAPER_PRINT = 'paper_print';
    case UNIT_TIER = 'unit_tier';
    case AREA_UNIT = 'area_unit';
    case MATRIX = 'matrix';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
