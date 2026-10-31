<?php

namespace App\Enums;

enum PaymentWebhookEventType: string
{
    case DEPOSIT_CALLBACK = 'deposit_callback';

    public function label(): string
    {
        return match ($this) {
            self::DEPOSIT_CALLBACK => '입금 콜백',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
