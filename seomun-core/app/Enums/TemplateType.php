<?php

namespace App\Enums;

enum TemplateType: string
{
    case NO_FOLD = 'no-fold';
    case TWO_FOLD = '2-fold';
    case THREE_FOLD = '3-fold';
    case FOUR_FOLD = '4-fold';

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
            self::NO_FOLD => 'No Fold',
            self::TWO_FOLD => '2 Fold',
            self::THREE_FOLD => '3 Fold',
            self::FOUR_FOLD => '4 Fold',
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