<?php

namespace App\Enums;

enum TemplateOrientation: string
{
    case HORIZONTAL = 'horizontal';
    case VERTICAL = 'vertical';

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
            self::HORIZONTAL => 'Horizontal',
            self::VERTICAL => 'Vertical',
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