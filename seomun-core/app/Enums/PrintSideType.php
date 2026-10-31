<?php

namespace App\Enums;

enum PrintSideType: string
{
    case SINGLE = 'SINGLE';
    case DOUBLE = 'DOUBLE';

    public static function fromValue(string $value): self
    {
        $upperValue = strtoupper(trim($value));

        if (str_contains($upperValue, 'SINGLE') || str_contains($upperValue, '단면')) {
            return self::SINGLE;
        }

        if (str_contains($upperValue, 'DOUBLE') || str_contains($upperValue, '양면')) {
            return self::DOUBLE;
        }
        
        return self::from($upperValue);
    }

    public static function values(): array
    {
        return array_map(
            fn(self $item) => $item->value,
            self::cases()
        );
    }
}