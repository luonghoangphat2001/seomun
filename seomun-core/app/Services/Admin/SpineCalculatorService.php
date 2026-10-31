<?php

namespace App\Services\Admin;

use App\Models\Paper;
use InvalidArgumentException;

class SpineCalculatorService
{
    public function calculate(array $data): array
    {
        $paper = Paper::query()
            ->findOrFail($data['paper_id']);

        $sheetCount = match ($data['print_side']) {
            'single' => $data['pages'],
            'double' => (int) ceil($data['pages'] / 2),
        };


        $specification = $paper->specification;

        $thickness = (is_array($specification) && isset($specification['thickness_mm']))
            ? $specification['thickness_mm']
            : 0;

        $spineWidth =
            $sheetCount * $thickness;

        return [
            'spine_width_mm' => round($spineWidth, 2),
        ];
    }
}
