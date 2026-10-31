<?php

namespace App\Enums;

enum ProductionCodeStatus: string
{
    case OPEN = 'open';     // 영업중
    case CLOSED = 'closed'; // 폐점

    public function label(): string
    {
        return match ($this) {
            self::OPEN => '영업중',
            self::CLOSED => '폐점',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::OPEN => 'Open',
            self::CLOSED => 'Closed',
        };
    }
}
