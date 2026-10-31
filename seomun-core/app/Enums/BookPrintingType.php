<?php

namespace App\Enums;

enum BookPrintingType: string
{
    case BOOKLET_COVER = 'BOOKLET_COVER';
    case BOOKLET_INNER = 'BOOKLET_INNER';

    public static function values(): array
    {
        return array_map(
            fn(self $item) => $item->value,
            self::cases()
        );
    }
}