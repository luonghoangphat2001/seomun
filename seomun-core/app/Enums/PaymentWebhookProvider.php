<?php

namespace App\Enums;

enum PaymentWebhookProvider: string
{
    case TOSS = 'toss';

    public function label(): string
    {
        return match ($this) {
            self::TOSS => '토스',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
