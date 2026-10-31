<?php

namespace App\Services\Quote;

use App\Enums\PriceType;
use App\Models\UnitPrice;
use InvalidArgumentException;

class BaseQuoteService
{
    public function calculate(
        ?int $productId,
        ?int $erpPaperOptionId,
        ?int $erpSizeOptionId,
        ?int $erpSubjectMasterOptionId,
        int $width,
        int $height,
        int $quantity,
        PriceType $priceType = PriceType::SUPPLY,
        bool $allowNull = true,
        array $selectedOptions = [],
    ): int {
        return $this->resolve(
            $productId,
            $erpPaperOptionId,
            $erpSizeOptionId,
            $erpSubjectMasterOptionId,
            $width,
            $height,
            $quantity,
            $selectedOptions,
            $priceType,
            $allowNull,
        );
    }

    private function resolve(
        ?int $productId,
        ?int $erpPaperOptionId,
        ?int $erpSizeOptionId,
        ?int $erpSubjectMasterOptionId,
        int $width,
        int $height,
        int $quantity,
        array $selectedOptions,
        PriceType $priceType,
        bool $allowNull,
    ): int {
        $unitPrice = UnitPrice::query()
            ->with('items')
            ->where('is_active', true);

        $unitPrice->where('product_id', $productId);

        if ($allowNull) {
            $unitPrice
                ->where(function ($query) use ($erpPaperOptionId) {
                    $query->where('erp_paper_option_id', $erpPaperOptionId)
                        ->orWhereNull('erp_paper_option_id');
                })
                ->where(function ($query) use ($erpSizeOptionId) {
                    $query->where('erp_size_option_id', $erpSizeOptionId)
                        ->orWhereNull('erp_size_option_id');
                })
                ->where(function ($query) use ($erpSubjectMasterOptionId) {
                    $query->where('erp_subject_master_option_id', $erpSubjectMasterOptionId)
                        ->orWhereNull('erp_subject_master_option_id');
                })
                ->orderByRaw('CASE WHEN erp_paper_option_id IS NULL THEN 1 ELSE 0 END')
                ->orderByRaw('CASE WHEN erp_size_option_id IS NULL THEN 1 ELSE 0 END')
                ->orderByRaw('CASE WHEN erp_subject_master_option_id IS NULL THEN 1 ELSE 0 END');
        } else {
            $unitPrice
                ->where('erp_paper_option_id', $erpPaperOptionId)
                ->where('erp_size_option_id', $erpSizeOptionId)
                ->where('erp_subject_master_option_id', $erpSubjectMasterOptionId);
        }

        $unitPrice = $unitPrice->get()
            ->filter(fn (UnitPrice $rule) => $this->matchesCombination($rule->combination_options, $selectedOptions))
            ->sortByDesc(fn (UnitPrice $rule) => count($rule->combination_options ?? []))
            ->first();

        if (!$unitPrice) {
            return 0;
        }

        $item = $unitPrice->items
            ->where('quantity_min', '<=', $quantity)
            ->sortByDesc('quantity_min')
            ->first();

        if (!$item || $item->quantity_min == 0) {
            return 0;
        }

        $priceValue = $priceType === PriceType::COST
            ? $item->raw_cost
            : $item->price_value;

        return (int) ($priceValue * round($quantity / $item->quantity_min, 2));
    }

    private function matchesCombination(?array $rule, array $selectedOptions): bool
    {
        foreach ($rule ?? [] as $code => $optionId) {
            if ((int) ($selectedOptions[$code] ?? 0) !== (int) $optionId) {
                return false;
            }
        }

        return true;
    }
}
