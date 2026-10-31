<?php

namespace App\Services\Admin;

use App\Enums\PriceType;
use App\Services\ProductQuoteService;

class AdminPriceSimulationService
{
    public function __construct(
        protected ProductQuoteService $productQuoteService,
    ) {
    }
    public function simulate(array $data): array
    {
        $productId = $data["product_id"];
        $selectedOptions = $data['selected_options'] ?? [];
        $quantity = (int) ($data['quantity_sets']['quantity'] ?? 1);
        $case = (int) ($data['quantity_sets']['multiplier'] ?? 1);
        $input_options = $data['input_options'] ?? [];

        $supplyResults = $this->productQuoteService->quote($productId, $selectedOptions, $input_options, $quantity, $case);
        $costResults = $this->productQuoteService->quote($productId, $selectedOptions, $input_options, $quantity, $case, PriceType::COST);


        $totalSupplyPrice = $supplyResults['total'];
        $totalRawCost = $costResults['total'];

        return [
            'summary' => [
                'quantity' => $quantity,

                'total_raw_cost' => round($totalRawCost),

                'total_selling_price' => round($totalSupplyPrice),

                'profit' => round(
                    $totalSupplyPrice - $totalRawCost,
                    2
                ),

                'profit_rate' => $totalRawCost > 0
                    ? round(
                        (
                            ($totalSupplyPrice - $totalRawCost)
                            / $totalRawCost
                        ) * 100
                    )
                    : 0,
            ],

            'selling_price' => $supplyResults,
            'raw_cost' => $costResults,
        ];
    }
}
