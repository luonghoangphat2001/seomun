<?php

namespace App\Enums;

enum TemplateSide: string
{
    case SINGLE = 'single';
    case DOUBLE = 'double';

    public static function values(): array
    {
        return array_map(
            fn(self $item) => $item->value,
            self::cases()
        );
    }

    public function label(): string
    {
        return match ($this) {
            self::SINGLE => 'Single',
            self::DOUBLE => 'Double',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn (self $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ],
            self::cases()
        );
    }
}