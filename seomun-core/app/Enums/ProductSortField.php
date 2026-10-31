<?php

namespace App\Enums;

enum ProductSortField: string
{
    case NAME = 'name';
    case PRICE = 'price';
    case CREATED_AT = 'created_at';
    case SORT_ORDER = 'sort_order';
    case VIEW_COUNT = 'view_count';

    /**
     * Get allowed sort fields for validation
     */
    public static function getAllowed(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Check if a field is allowed
     */
    public static function isValid(?string $field): bool
    {
        if (empty($field)) {
            return false;
        }

        return in_array($field, self::getAllowed());
    }
}
