<?php

namespace App\Services\Pricing\Formulas;

use App\Enums\PaperSizeDivisionCode;
use App\Enums\PrintSideType;
use App\Models\ErpOption;
use App\Models\PaperPrice;
use App\Models\PrintingPrice;
use App\Models\Product;
use App\Models\SizeOption;
use App\Services\Pricing\Contracts\PricingFormula;

/** Resolve per-section paper and printing prices from a typed Pricing Profile. */
class PaperPrintPricingFormula implements PricingFormula
{
    public function calculate(int $productId, array $selectedOptions, int $quantity, int $case): int
    {
        $components = $this->calculateComponents($productId, $selectedOptions, $quantity);

        return (int) round($components['paper_price'] + $components['printing_price']);
    }

    /** @return array{paper_price: float, printing_price: float} */
    public function calculateComponents(int $productId, array $selectedOptions, int $quantity): array
    {
        $product = Product::with(['pricingProfile', 'category'])->findOrFail($productId);
        $settings = $product->pricingProfile?->settings ?? [];
        $isHotDeal = (bool) data_get($settings, 'legacy_rule.is_hot_deal', false);
        $sectionNames = ($product->pricing_structure?->value ?? $product->pricing_structure) === 'cover_inner'
            ? ['cover', 'inner']
            : ['single'];
        $paperTotal = 0;
        $printingTotal = 0;

        foreach ($sectionNames as $sectionName) {
            $section = $settings['sections'][$sectionName] ?? null;
            if (! is_array($section)) {
                return ['paper_price' => 0, 'printing_price' => 0];
            }
            [$printing, $sheet] = $this->resolvePrintingPrice($section, $selectedOptions, $isHotDeal);
            if (! $sheet instanceof PaperSizeDivisionCode) {
                return ['paper_price' => 0, 'printing_price' => 0];
            }

            $paperGroup = $section['paper_option_group'] ?? null;
            $paperOption = $paperGroup ? ErpOption::find($selectedOptions[$paperGroup] ?? null) : null;
            if (! $paperOption?->paper_id) {
                return ['paper_price' => 0, 'printing_price' => 0];
            }
            $pages = $this->pageCount($selectedOptions, $section['page_count_field'] ?? null);
            $sheetCount = $this->sheetCount($selectedOptions, $quantity, $pages, $sheet);
            $paperRate = PaperPrice::query()
                ->where('paper_id', $paperOption->paper_id)
                ->where('paper_size_division_code', $sheet->value)
                ->where('is_hot_deal', false)
                ->value('supply_price');
            if ($paperRate === null) {
                return ['paper_price' => 0, 'printing_price' => 0];
            }

            $side = $this->resolveSide($selectedOptions, $section['side_option_group'] ?? null);
            if (($section['side_option_group'] ?? null) !== null && ! $side) {
                return ['paper_price' => 0, 'printing_price' => 0];
            }
            if ($printing->side_type !== null && ($printing->side_type?->value) !== ($side?->value)) {
                return ['paper_price' => 0, 'printing_price' => 0];
            }
            $tier = $printing?->printingPriceItems->where('quantity', '<=', $sheetCount)->sortByDesc('quantity')->first();
            if (! $tier || (int) $tier->quantity < 1) {
                return ['paper_price' => 0, 'printing_price' => 0];
            }
            // Round the per-sheet paper rate before multiplying by sheet count.
            $paperTotal += round($paperRate * 5 / 6) * $sheetCount;
            $printingTotal += $tier->supply_price * ($sheetCount / $tier->quantity);
        }

        return [
            'paper_price' => $paperTotal,
            'printing_price' => $printingTotal,
        ];
    }

    /** @return array{0: PrintingPrice|null, 1: PaperSizeDivisionCode|null} */
    private function resolvePrintingPrice(array $section, array $selectedOptions, bool $isHotDeal): array
    {
        $sizeOption = SizeOption::whereHas('erpOptions', function ($query) use ($selectedOptions): void {
            $query->where('id', $selectedOptions['size'] ?? null);
        })->first();
        $sizeKey = $sizeOption?->name;
        $mapping = $sizeKey ? ($section['size_mappings'][$sizeKey] ?? null) : null;
        $printingId = is_array($mapping)
            ? ($mapping['printing_price_id'] ?? null)
            : ($section['printing_price_id'] ?? null);

        $printing = PrintingPrice::with('printingPriceItems')
            ->when($printingId, fn ($query) => $query->whereKey($printingId))
            ->where('is_hot_deal', $isHotDeal)
            ->first();
        if (! $printing) {
            return [null, null];
        }

        // Common profiles may have a legacy fixed printing ID. Resolve the
        // matching single/double-sided rate when the selected side differs.
        $sideCode = $section['side_option_group'] ?? null;
        $sideValue = $sideCode ? ErpOption::find($selectedOptions[$sideCode] ?? null)?->value : null;
        if ($printing->side_type !== null && $sideValue !== null
            && $printing->side_type->value !== $sideValue) {
            $printing = PrintingPrice::with('printingPriceItems')
                ->where('machine_type', $printing->machine_type->value)
                ->where('book_printing_size_type', $printing->book_printing_size_type?->value)
                ->where('book_printing_type', $printing->book_printing_type?->value)
                ->where('paper_size_division_code', $printing->paper_size_division_code?->value)
                ->where('side_type', $sideValue)
                ->where('is_hot_deal', $isHotDeal)
                ->first();
            if (! $printing) {
                return [null, null];
            }
        }

        $division = is_array($mapping) ? ($mapping['paper_size_division_code'] ?? null) : null;
        $division ??= $printing->paper_size_division_code?->value;
        $division ??= match ($printing->book_printing_size_type?->value) {
            'nation_4' => PaperSizeDivisionCode::NATIONAL_4->value,
            'nation_8' => PaperSizeDivisionCode::NATIONAL_8->value,
            'nation_16' => PaperSizeDivisionCode::NATIONAL_16->value,
            default => null,
        };

        return [$printing, $division ? PaperSizeDivisionCode::tryFrom($division) : null];
    }

    private function pageCount(array $selectedOptions, ?string $field): int
    {
        return $field ? max(1, (int) ($selectedOptions[$field] ?? 1)) : 1;
    }

    private function sheetCount(array $selectedOptions, int $quantity, int $pages, PaperSizeDivisionCode $sheet): int
    {
        $width = max(1, (float) ($selectedOptions['width'] ?? 0));
        $height = max(1, (float) ($selectedOptions['height'] ?? 0));
        $fit = max(1, (int) max(
            floor(($sheet->width() + 3) / ($width + 3)) * floor(($sheet->height() + 3) / ($height + 3)),
            floor(($sheet->width() + 3) / ($height + 3)) * floor(($sheet->height() + 3) / ($width + 3)),
        ));

        return max(1, (int) ceil(($quantity * $pages) / $fit));
    }

    private function resolveSide(array $selectedOptions, ?string $groupCode): ?PrintSideType
    {
        if (! $groupCode || empty($selectedOptions[$groupCode])) {
            return null;
        }
        $value = ErpOption::find($selectedOptions[$groupCode])?->value;

        return $value ? PrintSideType::fromValue($value) : null;
    }
}
