<?php

namespace App\Enums;

enum MachineType: string
{
    case IX3200 = 'IX3200';
    case P1350 = 'P1350';
    case P140 = 'P140';

    public static function values(): array
    {
        return array_map(
            fn(self $item) => $item->value,
            self::cases()
        );
    }
}
