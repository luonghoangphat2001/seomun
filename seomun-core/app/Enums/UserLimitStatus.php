<?php

namespace App\Enums;

enum UserLimitStatus: string
{
    case ACTIVE = 'active';   // 활성화
    case INACTIVE = 'inactive';   // 비활성화

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Active',
            self::INACTIVE => 'Inactive',
        };
    }
}
