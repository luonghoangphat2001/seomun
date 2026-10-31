<?php

namespace App\Services\Price;

use App\Models\OrderCodeOptionMapping;

/**
 * Price Calculation Service
 * Used by both getPrice API and ERP Transformer
 *
 * Two pricing modes per option group:
 *
 * Area-based (OP903 소재 / OP904 잉크 / OP905 합지 / OP906 코팅 / OP907 재단):
 *   cost = pages × qty × osrc_um × (w/1000) × (h/1000)
 *   + if area ≤ 0.25 m² → add osrc_um_min once (최소단가)
 *
 * Flat (OP908 기본후가공 / OP909 추가후가공 / OP910 추가물품):
 *   cost = pages × qty × osrc_um
 *
 * Total → floor to 1원, apply api_ratio_com, ceil to 100.
 * Tax = ceil(price × 10%) to nearest 10.
 */
class PriceCalculator
{
    /**
     * @param  array  $itemData  Item data including size, options, quantity
     * @param  float  $apiRatioCom  Customer rate ratio (e.g., 180 = 180%)
     * @param  float  $sizeRatio  Size ratio (default 100)
     * @return array Price breakdown
     */
    public function calculate(array $itemData, float $apiRatioCom = 100, float $sizeRatio = 100): array
    {
        $orderCode = $itemData['item_code'] ?? $itemData['item_code3'] ?? '9403';
        $size1 = (float) ($itemData['size1'] ?? 0);
        $size2 = (float) ($itemData['size2'] ?? 0);
        $quantity = (int) ($itemData['qnt'] ?? $itemData['quantity'] ?? 1);
        $pages = 1; // default pages = 1

        // area in m²
        $area = ($size1 / 1000) * ($size2 / 1000);

        // Get option mapping for this order code
        $optionMapping = OrderCodeOptionMapping::where('order_code', $orderCode)->first();

        // Initialize raw osrc_um prices per group
        $materialPrice = 0;  // OP903 - 소재
        $inkPrice = 0;  // OP904 - 잉크
        $laminationPrice = 0;  // OP905 - 합지
        $coatingPrice = 0;  // OP906 - 코팅
        $cuttingPrice = 0;  // OP907 - 재단
        $processPrice = 0;  // OP908/909 - 후가공 (flat)
        $additionalPrice = 0;  // OP910 - 추가물품 (flat)

        // osrc_um_min per group — used as minimum charge when area ≤ 0.25 m²
        $materialPriceMin = 0;
        $inkPriceMin = 0;
        $laminationPriceMin = 0;
        $coatingPriceMin = 0;
        $cuttingPriceMin = 0;

        if ($optionMapping) {
            $availableOptions = $optionMapping->erpOptions()->get();

            for ($i = 1; $i <= 8; $i++) {
                $optKey = "opt{$i}";
                $optValue = $itemData[$optKey] ?? '';
                if (empty($optValue)) {
                    continue;
                }

                // Parse all sub-items (handles comma-merged opt7: "거치대A/1개,거치대B/2개")
                $subItems = OptParser::parseAll($optValue);

                foreach ($subItems as $parsed) {
                    $label = $parsed['name'];
                    if (empty($label)) {
                        continue;
                    }

                    $matchingOption = $availableOptions->first(function ($option) use ($label) {
                        return $option->label === $label ||
                            strpos($option->label, $label) === 0;
                    });

                    if (! $matchingOption) {
                        continue;
                    }

                    // osrc_um: pivot overrides erp_option, fallback to additional_price
                    $pivotPrice = $matchingOption->pivot->osrc_um ?? null;
                    $optionPrice = (float) ($pivotPrice !== null
                        ? $pivotPrice
                        : ($matchingOption->osrc_um > 0
                            ? $matchingOption->osrc_um
                            : $matchingOption->additional_price));

                    // osrc_um_min: from pivot, fallback to 0 (will use osrc_um as min if 0)
                    $optionPriceMin = (float) ($matchingOption->pivot->osrc_um_min ?? 0);

                    $groupCode = $matchingOption->erpOptionGroup->code ?? '';

                    // For OP910: use opt-level qty if present, otherwise fall back to order qty
                    $optQty = (isset($parsed['quantity']) && $parsed['quantity'] !== null)
                        ? $parsed['quantity']
                        : $quantity;

                    switch ($groupCode) {
                        case 'OP903':
                            $materialPrice = $optionPrice * $optQty;
                            $materialPriceMin = $optionPriceMin;
                            break;
                        case 'OP904':
                            $inkPrice = $optionPrice * $optQty;
                            $inkPriceMin = $optionPriceMin;
                            break;
                        case 'OP905':
                            $laminationPrice = $optionPrice * $optQty;
                            $laminationPriceMin = $optionPriceMin;
                            break;
                        case 'OP906':
                            $coatingPrice = $optionPrice * $optQty;
                            $coatingPriceMin = $optionPriceMin;
                            break;
                        case 'OP907':
                            $cuttingPrice = $optionPrice * $optQty;
                            $cuttingPriceMin = $optionPriceMin;
                            break;
                        case 'OP908':
                        case 'OP909':
                            $processPrice += $optionPrice;
                            break;
                        case 'OP910':
                            // Flat price: use opt-level qty (not main order qty)
                            $additionalPrice += $optionPrice * $optQty;
                            break;
                        default:
                            $additionalPrice += $optionPrice;
                            break;
                    }
                }
            }
        }

        // --- Area-based (OP903/904/905/906/907): pages × qty × osrc_um × (w/1000) × (h/1000)
        //     + if area ≤ 0.25 m² → add osrc_um_min once (최소단가)
        //       osrc_um_min comes from pivot; falls back to osrc_um if not set
        //     floor to 1원
        $calcAreaCost = function (float $unitPrice, float $minPrice) use ($pages, $quantity, $area): float {
            if ($unitPrice <= 0) {
                return 0.0;
            }
            $cost = $pages * $quantity * $unitPrice * $area;
            if ($area <= 0.25) {
                $cost += $minPrice;
            }

            return floor($cost); // 1원 단위 절사
        };

        // --- Flat (OP908/909/910): pages × qty × osrc_um, floor to 1원
        $calcFlatCost = function (float $unitPrice) use ($pages, $quantity): float {
            if ($unitPrice <= 0) {
                return 0.0;
            }

            return floor($pages * $quantity * $unitPrice); // 1원 단위 절사
        };

        $materialCost = $calcAreaCost($materialPrice, $materialPriceMin);
        $inkCost = $calcAreaCost($inkPrice, $inkPriceMin);
        $laminationCost = $calcAreaCost($laminationPrice, $laminationPriceMin);
        $coatingCost = $calcAreaCost($coatingPrice, $coatingPriceMin);
        $cuttingCost = $calcAreaCost($cuttingPrice, $cuttingPriceMin);
        $processCost = $calcFlatCost($processPrice);
        $additionalCost = $calcFlatCost($additionalPrice);

        // price_cost = total raw base cost
        $basePriceCost = $calcFlatCost($materialPrice) + $calcFlatCost($inkPrice) + $calcFlatCost($laminationPrice) + $calcFlatCost($coatingPrice) + $calcFlatCost($cuttingPrice) + $calcFlatCost($processPrice) + $calcFlatCost($additionalPrice);
        $priceCost = $materialCost + $inkCost + $laminationCost + $coatingCost + $cuttingCost + $processCost + $additionalCost;

        // Apply api_ratio_com to area-based costs only (OP903/904/905/906/907/908/909).
        // OP910 추가물품 is a flat fixed price — ratio does NOT apply.
        $ratio = $apiRatioCom / 100;

        // price_prn = 인쇄비 (소재 + 잉크 + 합지) × ratio
        $pricePrn = ($materialCost + $inkCost + $laminationCost);
        // price_opt1 = 후가공비 (코팅 + 재단 + 추가후가공) × ratio
        $priceOpt1 = ($coatingCost + $cuttingCost + $processCost);
        // price_opt2 = 추가물품비 — flat, no ratio applied
        $priceOpt2 = $additionalCost;

        $price = $this->ceilTo100($pricePrn + $priceOpt1 + $priceOpt2);

        // Tax = ceil(price * 0.1 / 10) * 10
        $tax = $this->ceilTo10($price * 0.1);

        $pricePrd = $price + $tax;

        // paper_width kept for compatibility (to be updated when client provides roll width data)
        $paperWidth = $size1 + 10 + 25;

        return [
            'base' => [
                'material_price' => $materialPrice,
                'ink_price' => $inkPrice,
                'lamination_price' => $laminationPrice,
                'coating_price' => $coatingPrice,
                'cutting_price' => $cuttingPrice,
                'process_price' => $processPrice,
                'additional_price' => $additionalPrice,
                'material_cost' => $materialCost,
                'ink_cost' => $inkCost,
                'lamination_cost' => $laminationCost,
                'coating_cost' => $coatingCost,
                'cutting_cost' => $cuttingCost,
                'process_cost' => $processCost,
                'additional_cost' => $additionalCost,
                'price_cost' => $priceCost,
                'base_price_cost' => $basePriceCost,
            ],
            'sale' => [
                'price_prn' => $pricePrn,
                'price_opt1' => $priceOpt1,
                'price_opt2' => $priceOpt2,
                'price' => $price,
                'tax' => $tax,
                'price_prd' => $pricePrd,
            ],
            'debug' => [
                'api_ratio_com' => $apiRatioCom,
                'area' => $area,
                'paper_width' => $paperWidth,
                'size1' => $size1,
                'size2' => $size2,
                'quantity' => $quantity,
                'pages' => $pages,
            ],
        ];
    }

    /**
     * Ceil to nearest 100
     */
    protected function ceilTo100(float $value): int
    {
        return (int) (ceil($value / 100) * 100);
    }

    /**
     * Ceil to nearest 10
     */
    protected function ceilTo10(float $value): int
    {
        return (int) (ceil($value / 10) * 10);
    }

    /**
     * Round to nearest 100 (kept for backward compatibility)
     */
    protected function roundTo100(float $value): int
    {
        return (int) (round($value / 100) * 100);
    }

    /**
     * Round to nearest 10 (kept for backward compatibility)
     */
    protected function roundTo10(float $value): int
    {
        return (int) (round($value / 10) * 10);
    }
}
