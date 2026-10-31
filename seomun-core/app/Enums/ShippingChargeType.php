<?php

namespace App\Enums;

enum ShippingChargeType: string
{
    case PAID = 'paid';     // 부과
    case FREE = 'free';     // 무료

    public function label(): string
    {
        return match ($this) {
            self::PAID => '부과',
            self::FREE => '무료',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::PAID => 'Paid',
            self::FREE => 'Free',
        };
    }
}
