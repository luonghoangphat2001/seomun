<?php

namespace App\Enums;

enum PointTransactionCategory: string
{
    case PAYMENT = 'payment';
    case INVITE = 'invite';
    case MANUAL = 'manual';
    case ORDER = 'order';

    public function label(): string
    {
        return match ($this) {
            self::PAYMENT => 'Payment',
            self::INVITE => 'Invite',
            self::MANUAL => 'Manual',
            self::ORDER => 'Order',
        };
    }
}
