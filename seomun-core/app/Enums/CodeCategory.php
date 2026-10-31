<?php

namespace App\Enums;

enum CodeCategory: string
{
    case PRODUCTION = 'production';   // 제작처

    public function label(): string
    {
        return match ($this) {
            self::PRODUCTION => '제작처',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::PRODUCTION => 'Production Source',
        };
    }
}
