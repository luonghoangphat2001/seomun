<?php

namespace App\Support;

final class RealtimeChannel
{
    public const MEMBER_NOTIFICATIONS = 'member.notifications';

    public const MEMBER_NOTIFICATION_CREATED_EVENT = 'notification.created';

    public static function memberNotifications(int|string $userId): string
    {
        return self::MEMBER_NOTIFICATIONS.".{$userId}";
    }
}
