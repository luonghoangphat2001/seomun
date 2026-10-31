<?php

namespace App\Services\Quote;

use App\Models\UnitPrice;
use App\Models\UnitPriceItem;

class SquareTicketQuoteService
{
    public static function calculate(
        int $erpPaperOptionId,
        int $width,
        int $height,
        int $quantity
    ): ?int {
        $short = min($width, $height);
        $long = max($width, $height);

        $matched = false;

        foreach (self::SIZE_RULES as $rule) {
            if (
                $rule['width'] >= $short &&
                $long >= $rule['min_length'] &&
                $long <= $rule['max_length']
            ) {
                $matched = true;
                break;
            }
        }

        $unitPrice = UnitPrice::query()
            ->with(['items'])
            ->where('product_type', 'square_ticket')
            ->where('erp_paper_option_id', $erpPaperOptionId)
            ->where('is_active', true)
            ->first();

        if (! $unitPrice) {
            return null;
        }

        $matchedItem = $unitPrice->items
            ->where('quantity_min', '<=', $quantity)
            ->sortByDesc('quantity_min')
            ->first();

        if (! $matchedItem) {
            return null;
        }

        if ($matched) {
            return (int) $matchedItem->price_value;
        }

        $scale = $matchedItem->attributes['scale'] ?? null;

        return $scale === null
            ? null
            : (int) round($width * $height * $scale);
    }

    private const SIZE_RULES = [
        ['width' => 30, 'min_length' => 30, 'max_length' => 160],
        ['width' => 40, 'min_length' => 30, 'max_length' => 120],
        ['width' => 50, 'min_length' => 30, 'max_length' => 90],
        ['width' => 60, 'min_length' => 30, 'max_length' => 80],
        ['width' => 70, 'min_length' => 30, 'max_length' => 70],
        ['width' => 80, 'min_length' => 30, 'max_length' => 60],
        ['width' => 90, 'min_length' => 30, 'max_length' => 50],
        ['width' => 100, 'min_length' => 30, 'max_length' => 40],
        ['width' => 110, 'min_length' => 30, 'max_length' => 40],
        ['width' => 120, 'min_length' => 30, 'max_length' => 40],
        ['width' => 130, 'min_length' => 30, 'max_length' => 30],
        ['width' => 140, 'min_length' => 30, 'max_length' => 30],
        ['width' => 150, 'min_length' => 30, 'max_length' => 30],
        ['width' => 160, 'min_length' => 30, 'max_length' => 30],
    ];
}
