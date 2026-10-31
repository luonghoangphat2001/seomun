<?php

namespace App\Services;

use App\Models\Paper;
use App\Models\Product;
use App\Models\ProductOption;
use Illuminate\Database\Eloquent\Collection;

class PaperService
{
    public function getActivePapers(): Collection
    {
        return Paper::where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function getPapersByProductId(int $productId)
    {
        $papers = Paper::query()
            ->where('is_active', true)
            ->whereHas('erpOptions', function ($query) use ($productId) {
                $query->whereHas('productOptions', function ($query) use ($productId) {
                    $query->whereHas('group', function ($query) use ($productId) {
                        $query->where('product_id', $productId);
                    });
                });
            })
            ->with([
                'paperTypeOption',
                'paperColorOption',
                'paperWeightOption',
            ])
            ->orderBy('name')
            ->get();

        $paperOptionMap = ProductOption::query()
            ->with([
                'group:id,product_id',
                'erpOption:id,paper_id',
            ])
            ->whereHas('group', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->get()
            ->filter(fn($option) => $option->erpOption?->paper_id)
            ->groupBy(fn($option) => $option->erpOption->paper_id);

        return $papers
            ->filter(fn($paper) => $paper->paperTypeOption && $paper->paperWeightOption)
            ->groupBy(fn($paper) => $paper->paperTypeOption->id)
            ->map(function ($typePapers) use ($paperOptionMap) {

                $paperType = $typePapers->first()->paperTypeOption;

                return [
                    'id' => $paperType->id,
                    'code' => $paperType->code,
                    'label' => $paperType->label,
                    'value' => $paperType->value,
                    'attributes' => $paperType->attributes,

                    'paper_colors' => $typePapers
                        ->groupBy(fn($paper) => $paper->paperColorOption?->id ?? 'no_color')
                        ->map(function ($colorPapers) use ($paperOptionMap) {

                            $paperColor = $colorPapers->first()->paperColorOption;

                            return [
                                'id' => $paperColor?->id,
                                'code' => $paperColor?->code,
                                'label' => $paperColor?->label,
                                'value' => $paperColor?->value,

                                'paper_weights' => $colorPapers
                                    ->sortBy(fn($paper) => $paper->paperWeightOption->sort_order)
                                    ->map(function ($paper) use ($paperOptionMap) {

                                        $paperOption = $paperOptionMap->get($paper->id)?->first();
                                        $paperOptions = $paperOptionMap->get($paper->id, collect());
                                        $weight = $paper->paperWeightOption;

                                        return [
                                            'id' => $weight->id,
                                            'code' => $weight->code,
                                            'label' => $weight->label,
                                            'value' => $weight->value,

                                            'paper' => [
                                                'id' => $paper->id,
                                                'option_id' => $paperOption?->id,
                                                'group_id' => $paperOption?->option_group_id,
                                                'options' => $paperOptions->map(fn($paperOption) => [
                                                    'option_id' => $paperOption->id,
                                                    'group_id' => $paperOption->option_group_id,
                                                ])->values(),
                                                'name' => $paper->name,
                                                'specification' => $paper->specification,
                                            ],
                                        ];
                                    })
                                    ->sortBy(fn($item) => (int) $item['value'])
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();
    }
}
