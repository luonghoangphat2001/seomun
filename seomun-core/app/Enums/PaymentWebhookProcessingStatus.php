<?php

namespace App\Enums;

enum PaymentWebhookProcessingStatus: string
{
    case RECEIVED = 'received';
    case PROCESSING = 'processing';
    case SUCCESS = 'success';
    case FAILED = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::RECEIVED => '받았다',
            self::PROCESSING => '처리 중',
            self::SUCCESS => '성공',
            self::FAILED => '실패',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
