<?php

namespace App\Enums;

/**
 * User Authority Enum
 *
 * Roles and Dashboard mapping:
 * - SUPER_ADMIN -> Super Admin Dashboard (/admin/super)
 * - STORE_ADMIN -> Store Admin Dashboard (/admin/store)
 * - USER -> User Dashboard (/dashboard)
 */
enum UserAuthority: string
{
    case SUPER_ADMIN = 'super_admin';
    case STORE_ADMIN = 'store_admin';
    case PARTNER = 'partner';
    case USER = 'normal_user';

    /**
     * Check if authority is admin type
     */
    public function isAdmin(): bool
    {
        return in_array($this, [self::SUPER_ADMIN, self::STORE_ADMIN]);
    }

    /**
     * Check if authority is super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this === self::SUPER_ADMIN;
    }

    /**
     * Check if authority is customer
     */
    public function isCustomer(): bool
    {
        return $this === self::USER;
    }

    /**
     * Try to get enum from string value
     */
    public static function tryFromString(?string $value): ?self
    {
        if (! $value) {
            return null;
        }

        return self::tryFrom($value);
    }
}
