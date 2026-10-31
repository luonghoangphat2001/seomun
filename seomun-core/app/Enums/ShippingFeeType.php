<?php

namespace App\Enums;

enum ShippingFeeType: string
{
    case PAYMENT = '2';      // Payment
    case PREPAID = '3';      // Prepaid

    /**
     * Get label for shipping fee type
     */
    public function label(): string
    {
        return match ($this) {
            self::PAYMENT => 'Payment',
            self::PREPAID => 'Prepaid',
        };
    }
}
