<?php

namespace App\Enums;

enum CouponTargetType: string
{
    case SPECIFIC_USERS = 'specific_users';
    case ALL_USERS = 'all_users';
    case MEMBERSHIP_TIER = 'membership_tier';
    case CUSTOMER = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::SPECIFIC_USERS => '특정 회원',
            self::ALL_USERS => '전체 회원',
            self::MEMBERSHIP_TIER => '회원 등급',
            self::CUSTOMER => '고객사',
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
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}
