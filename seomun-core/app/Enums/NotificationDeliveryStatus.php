<?php

namespace App\Enums;

enum NotificationDeliveryStatus: string
{
    case PENDING = 'pending';
    case SENDING = 'sending';
    case ACCEPTED = 'accepted';
    case FAILED = 'failed';

    /** @return array<int, string> */
    public static function dispatchableValues(): array
    {
        return [self::PENDING->value, self::FAILED->value];
    }
}
