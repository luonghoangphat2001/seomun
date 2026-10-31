<?php

namespace App\Enums;

enum CustomerShippingFee: string
{
    case BUNDLE = 'bundle';   // 묶음

    public function label(): string
    {
        return match ($this) {
            self::BUNDLE => '묶음',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::BUNDLE => 'Bundle',
        };
    }
}
