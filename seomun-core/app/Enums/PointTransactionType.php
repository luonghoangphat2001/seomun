<?php

namespace App\Enums;

enum PointTransactionType: string
{
    case EARN = 'earn';
    case USE = 'use';
    case EXPIRE = 'expire';
    case REFUND = 'refund';

    public function label(): string
    {
        return match ($this) {
            self::EARN => '적립',
            self::USE => '사용',
            self::EXPIRE => '만료',
            self::REFUND => '환불',
        };
    }

    public function isPositive(): bool
    {
        return in_array($this, [self::EARN, self::REFUND], true);
    }
}
