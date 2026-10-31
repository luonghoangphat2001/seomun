<?php

namespace App\Enums;

enum UnitPriceCategory: string
{
    case PAPER = 'PAPER';
    case PRINTING = 'PRINTING';
    case OUTPUT = 'OUTPUT';
    case MATERIALS = 'MATERIALS';
    case BINDING = 'BINDING';
    case POST_PROCESSING = 'POST_PROCESSING';
    case DESIGN = 'DESIGN';
    case ITEM_PRICE_LIST = 'ITEM_PRICE_LIST';
    case OTHER = 'OTHER';

    public function label(): string
    {
        return match ($this) {
            self::PAPER => 'Paper',
            self::PRINTING => 'Printing',
            self::OUTPUT => 'Output',
            self::MATERIALS => 'Materials',
            self::BINDING => 'Binding',
            self::POST_PROCESSING => 'Post-processing',
            self::DESIGN => 'Design',
            self::ITEM_PRICE_LIST => 'Item Price List',
            self::OTHER => 'Other',
        };
    }

    /**
     * Get all category values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get all categories with labels
     */
    public static function options(): array
    {
        return array_map(
            fn (self $category) => [
                'value' => $category->value,
                'label' => $category->label(),
            ],
            self::cases()
        );
    }
}
