<?php

namespace App\Enums;

enum ProductOptionGroupTab: string
{
    case PAPER = 'PAPER';
    case PRINTING = 'PRINTING';
    case POST_PROCESSING = 'POST_PROCESSING';

    public function label(): string
    {
        return match ($this) {
            self::PAPER => 'Paper',
            self::PRINTING => 'Printing',
            self::POST_PROCESSING => 'Post-processing',
        };
    }

    /**
     * Get all tab values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get all tabs with labels
     */
    public static function options(): array
    {
        return array_map(
            fn (self $tab) => [
                'value' => $tab->value,
                'label' => $tab->label(),
            ],
            self::cases()
        );
    }
}
