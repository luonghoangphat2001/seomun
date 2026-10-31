<?php

namespace App\Enums;

enum ApprovalRequestType: string
{
    case NEW_SIGNUP = 'new_signup';
    case INFORMATION_MODIFICATION = 'information_modification';
    case PERMISSION_CHANGE = 'permission_change';

    public function label(): string
    {
        return match ($this) {
            self::NEW_SIGNUP => 'New sign-up',
            self::INFORMATION_MODIFICATION => 'Information modification',
            self::PERMISSION_CHANGE => 'Permission change',
        };
    }
}
