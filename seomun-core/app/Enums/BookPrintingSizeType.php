<?php

namespace App\Enums;

enum BookPrintingSizeType: string
{
    case TYPE_A = 'TYPE_A';
    case TYPE_B = 'TYPE_B';
    case TYPE_C = 'TYPE_C';
    case A4 = 'A4';
    case A5 = 'A5';
    case B5 = 'B5';

    case NATION4 = 'nation_4';
    case NATION8 = 'nation_8';
    case NATION16 = 'nation_16';

    public static function isMachineP1350(string|self $value): bool
    {
        $actualValue = $value instanceof self ? $value->value : strtoupper($value);

        return in_array($actualValue, [
            self::TYPE_A->value,
            self::TYPE_B->value,
            self::TYPE_C->value,
        ]);
    }

    public static function values(): array
    {
        return array_map(
            fn(self $item) => $item->value,
            self::cases()
        );
    }
}