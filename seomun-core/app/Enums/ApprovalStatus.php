<?php

namespace App\Enums;

enum ApprovalStatus: string
{
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case REJECTED = 'rejected';

    public static function default(): self
    {
        return self::PENDING;
    }

    public static function tryFromString(?string $value): ?self
    {
        return $value ? self::tryFrom($value) : null;
    }

    public function isPending(): bool
    {
        return $this === self::PENDING;
    }

    public function isAccepted(): bool
    {
        return $this === self::ACCEPTED;
    }

    public function isRejected(): bool
    {
        return $this === self::REJECTED;
    }

    public function label(): string
    {
        return match ($this) {
            self::PENDING => '대기',
            self::ACCEPTED => '승인',
            self::REJECTED => '거절',
        };
    }
}
