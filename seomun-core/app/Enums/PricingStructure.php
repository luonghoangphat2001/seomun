<?php

namespace App\Enums;

enum PricingStructure: string
{
    case SINGLE = 'single';
    case COVER_INNER = 'cover_inner';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
