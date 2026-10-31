<?php

namespace App\Enums;

enum CustomerSkin: string
{
    case BASIC = 'basic';                 // 기본
    case CAFE_AMERICANO = 'cafe_americano'; // 카페아메리카노

    public function label(): string
    {
        return match ($this) {
            self::BASIC => '기본',
            self::CAFE_AMERICANO => '카페아메리카노',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::BASIC => 'Basic',
            self::CAFE_AMERICANO => 'Cafe Americano',
        };
    }
}
