<?php

namespace App\Enums;

enum OrderShipmentType: string
{
    case COMBINED = 'combined';
    case SEPARATE = 'separate';

    public function label(string $locale = 'en'): string
    {
        return match($locale) {
            'ko' => match($this) {
                self::COMBINED => '합배송',
                self::SEPARATE => '따로배송',
            },
            'ja' => match($this) {
                self::COMBINED => '合同配送',
                self::SEPARATE => '個別配送',
            },
            default => match($this) {
                self::COMBINED => 'Combined',
                self::SEPARATE => 'Separate',
            },
        };
    }
}
