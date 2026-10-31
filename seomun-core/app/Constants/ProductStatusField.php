<?php

namespace App\Constants;

/**
 * Product Status Field Constants
 * 제품 상태 필드 상수
 */
class ProductStatusField
{
    /**
     * Allowed product status fields for toggle/update
     */
    public const ALLOWED_FIELDS = [
        'is_active',
        'is_popular',
        'is_featured',
    ];

    /**
     * Check if a field is allowed
     */
    public static function isAllowed(string $field): bool
    {
        return in_array($field, self::ALLOWED_FIELDS, true);
    }
}
