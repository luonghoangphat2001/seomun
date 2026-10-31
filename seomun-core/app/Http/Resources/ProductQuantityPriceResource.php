<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductQuantityPriceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $qty = $this->quantity;
        $unit = $this->unit ?? 'sheets';
        $displayUnit = $this->formatDisplayUnit($unit);

        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'unit' => $unit,
            'display_unit' => $displayUnit,
            'price' => $this->price,
            'currency' => $this->currency,
            'production_days' => $this->production_days,
            'display' => [
                'quantity_text' => $this->formatQuantityDisplay($qty, $displayUnit),
                'price_text' => number_format($this->price).'원',
            ],
        ];
    }

    /**
     * Format unit to Korean display unit
     */
    private function formatDisplayUnit(?string $unit): string
    {
        return match (strtolower($unit ?? '')) {
            'sheets', 'sheet' => '매',
            'cases', 'case' => '건',
            'boxes', 'box' => '박스',
            default => $unit ?? '매',
        };
    }

    /**
     * Format quantity display text
     */
    private function formatQuantityDisplay(float|int $quantity, string $displayUnit): string
    {
        $normalized = fmod((float) $quantity, 1.0) === 0.0
            ? (string) ((int) $quantity)
            : rtrim(rtrim(number_format((float) $quantity, 2, '.', ''), '0'), '.');

        return "{$normalized}{$displayUnit}";
    }
}
