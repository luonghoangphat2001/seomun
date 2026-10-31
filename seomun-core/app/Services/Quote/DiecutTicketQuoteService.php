<?php

namespace App\Services\Quote;

use App\Models\UnitPrice;
use InvalidArgumentException;
use RuntimeException;

class DiecutTicketQuoteService
{
    public function calculate(
        int $erpPaperOptionId,
        int $width,
        int $height,
        int $quantity,
    ): ?int {
        $unitPrice = UnitPrice::query()
            ->with('items')
            ->where('product_type', 'diecut_ticket')
            ->where('erp_paper_option_id', $erpPaperOptionId)
            ->where('is_active', true)
            ->first();

        if (! $unitPrice) {
            return null;
        }

        $priceKey = $this->resolvePriceKey($quantity);

        if ($width === $height) {
            $item = $unitPrice->items
                ->firstWhere('attributes.size', $width);

            if ($item && isset($item->attributes['prices'][$priceKey])) {
                return (int) $item->attributes['prices'][$priceKey]['amount'];
            }
        }

        $matchedRule = collect(self::NON_STANDARD_SIZE_RULES)
            ->first(fn ($rule) => $rule['width'] === max($width, $height) && min($width, $height) >= $rule['length']['min'] && min($width, $height) <= $rule['length']['max']);

        if ($matchedRule) {
            $item = $unitPrice->items
                ->firstWhere('attributes.type', 'non_standard');

            if ($item && isset($item->attributes['prices'][$priceKey])) {
                return (int) $item->attributes['prices'][$priceKey]['amount'];
            }
        }

        return null;
    }

    private function resolvePriceKey(int $quantity): string
    {
        if ($quantity <= 500) {
            return '500';
        }

        if ($quantity <= 1000) {
            return '1000';
        }

        throw new RuntimeException('Quantity not supported.');
    }

    private const NON_STANDARD_SIZE_RULES = [
        ['width' => 10, 'length' => ['min' => 10, 'max' => 190]],
        ['width' => 20, 'length' => ['min' => 10, 'max' => 90]],
        ['width' => 30, 'length' => ['min' => 10, 'max' => 60]],
        ['width' => 40, 'length' => ['min' => 10, 'max' => 40]],
        ['width' => 50, 'length' => ['min' => 10, 'max' => 30]],
        ['width' => 60, 'length' => ['min' => 10, 'max' => 30]],
        ['width' => 70, 'length' => ['min' => 10, 'max' => 20]],
        ['width' => 80, 'length' => ['min' => 10, 'max' => 20]],
        ['width' => 90, 'length' => ['min' => 10, 'max' => 20]],
    ];
}
