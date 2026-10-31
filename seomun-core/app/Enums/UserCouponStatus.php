<?php

namespace App\Enums;

enum UserCouponStatus: string
{
    case AVAILABLE = 'available';
    case USED = 'used';
    case EXPIRED = 'expired';
    case UPCOMING = 'upcoming';

    /**
     * Korean label for status.
     */
    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE => '사용 가능',
            self::USED => '사용 완료',
            self::EXPIRED => '기간 만료',
            self::UPCOMING => '사용 예정',
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Values supported for filter tabs (including 'all').
     *
     * @return array<int, string>
     */
    public static function filterValues(): array
    {
        return array_merge(['all'], self::values());
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }

    public function isAvailable(): bool
    {
        return $this === self::AVAILABLE;
    }

    public function isUsed(): bool
    {
        return $this === self::USED;
    }

    public function isExpired(): bool
    {
        return $this === self::EXPIRED;
    }

    public function isUpcoming(): bool
    {
        return $this === self::UPCOMING;
    }
}
