<?php

namespace App\Enums;

enum ExposureTarget: string
{
    case ALL = 'all';
    case USER = 'user';

    public function label(): string
    {
        return match ($this) {
            self::ALL => 'All',
            self::USER => 'User',
        };
    }
}