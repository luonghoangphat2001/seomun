<?php

namespace App\Enums;

enum WebEditorType: string
{
    case SINGLE_SIDED = 'SINGLE_SIDED';
    case DOUBLE_SIDED = 'DOUBLE_SIDED';
    case BUSINESS_CARD = 'BUSINESS_CARD';
    case DOUBLE_FOLD = 'DOUBLE_FOLD';
    case TRIPLE_FOLD = 'TRIPLE_FOLD';
    case ENVELOPE = 'ENVELOPE';
    case SPIRAL_BINDING = 'SPIRAL_BINDING';
    case PERFECT_BINDING = 'PERFECT_BINDING';
    case STICKER = 'STICKER';

    public static function values(): array
    {
        return array_map(
            fn(self $item) => $item->value,
            self::cases()
        );
    }

    public static function labels(): array
    {
        return [
            self::SINGLE_SIDED->value => 'Single-sided',
            self::DOUBLE_SIDED->value => 'Double-sided',
            self::BUSINESS_CARD->value => 'Business Card',
            self::DOUBLE_FOLD->value => 'Double-fold',
            self::TRIPLE_FOLD->value => 'Triple-fold',
            self::ENVELOPE->value => 'Envelope',
            self::SPIRAL_BINDING->value => 'Spiral Binding',
            self::PERFECT_BINDING->value => 'Perfect Binding',
            self::STICKER->value => 'Sticker',
        ];
    }
}