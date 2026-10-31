<?php

namespace App\Enums;

enum UserStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case BLOCKED = 'blocked';
    case WITHDRAWN = 'withdrawn';

    public static function default(): self
    {
        return self::ACTIVE;
    }

    public static function tryFromString(?string $value): ?self
    {
        return $value ? self::tryFrom($value) : null;
    }

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    public function isInactive(): bool
    {
        return $this === self::INACTIVE;
    }

    public function isBlocked(): bool
    {
        return $this === self::BLOCKED;
    }

    public function isWithdrawn(): bool
    {
        return $this === self::WITHDRAWN;
    }

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => '활성',
            self::INACTIVE => '비활성',
            self::BLOCKED => '차단',
            self::WITHDRAWN => '탈퇴',
        };
    }
}
