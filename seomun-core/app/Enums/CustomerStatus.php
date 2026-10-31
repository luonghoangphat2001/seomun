<?php

namespace App\Enums;

enum CustomerStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';

    public static function default(): self
    {
        return self::ACTIVE;
    }

    public static function tryFromString(?string $value): ?self
    {
        return $value ? self::tryFrom($value) : null;
    }
}
