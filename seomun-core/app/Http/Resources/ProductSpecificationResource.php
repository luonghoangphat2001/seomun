<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductSpecificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'size' => [
                'width' => $this->size_width_mm,
                'height' => $this->size_height_mm,
                'unit' => $this->size_unit,
                'display' => $this->size_width_mm && $this->size_height_mm && $this->size_unit
                    ? "{$this->size_width_mm}mm x {$this->size_height_mm}mm"
                    : null,
            ],
            'production_time_days' => $this->production_time_days,
            'notes' => $this->notes,
            'dieline' => [
                'enabled' => (bool) ($this->dieline_enabled ?? false),
                'margin_mm' => (float) ($this->dieline_margin_mm ?? 2.0),
            ],
        ];
    }

    /**
     * Format print side value to Korean display text
     */
    private function formatPrintSide(?string $printSide): ?string
    {
        return match (strtolower($printSide ?? '')) {
            'double', 'both', '양면' => '양면',
            'single', 'one', '단면' => '단면',
            default => $printSide,
        };
    }
}
