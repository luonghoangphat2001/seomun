<?php

namespace App\Services;

use App\Enums\ShippingFeeType;
use App\Enums\ShippingMethod;
use App\Models\Product;
use App\Models\ShippingSetting;
use App\Models\User;

class ShippingFeeService
{
    /**
     * Resolve shipping fee with shipping method, item options, and product weight.
     *
     * @param array<string, mixed> $data Contains 'quantity', 'case', 'postcode', 'size', etc.
     */
    public function resolveShippingFeeWithMethod(
        ?User $user,
        float|int $subtotal,
        Product $product,
        ?ShippingMethod $shippingMethod,
        array $data,
        float|int $productWeight
    ): ?array {
        if ($shippingMethod === null) {
            return null;
        }

        // 1. Check configured date range free shipping campaign
        if ($this->isFreeShippingCampaignActive()) {
            return [
                'shipping_fee' => 0,
                'shipping_fee_type' => ShippingFeeType::PREPAID->value,
            ];
        }

        $case = max(1, (int) ($data['case'] ?? 1));
        $quantity = max(1, (int) ($data['quantity'] ?? 1));
        $postcode = $data['postcode'] ?? $data['shipping_postcode'] ?? null;
        $size = $data['size'] ?? null;

        $fee = match ($shippingMethod) {
            ShippingMethod::PICKUP => 0,
            ShippingMethod::QUICK => $this->resolveQuickShippingFee(
                $user,
                (float) $subtotal,
                $product,
                $productWeight,
                $quantity,
                $case,
                $size
            ),
            ShippingMethod::COURIER,
            ShippingMethod::DIRECT => $this->resolveShippingFromCustomer($user, (float) $subtotal, $product) !== null
                ? $this->resolveShippingFromCustomer($user, (float) $subtotal, $product) * $case
                : null,
            default => null,
        };

        if ($fee === null) {
            return null;
        }

        // 2. Check membership tier or B2B customer free shipping threshold
        if ($this->isUserEligibleForFreeShipping($user, (float) $subtotal)) {
            $fee = 0;
        }

        return [
            'shipping_fee' => max(0, $fee),
            'shipping_fee_type' => ShippingFeeType::PREPAID->value,
        ];
    }

    /**
     * Resolve Quick (퀵서비스) shipping fee based on box mapping, MOQ, weight, and quantity.
     */
    public function resolveQuickShippingFee(
        ?User $user,
        float $subtotal,
        Product $product,
        float|int $weightProduct,
        int $quantity = 1,
        int $case = 1,
        ?string $size = null
    ): ?int {
        $categoryName = $product->category?->name;
        if (! $categoryName) {
            return null;
        }

        $printleyConfigs = collect(config('shipping_fee.printley', []))
            ->where('category', $categoryName);

        if ($printleyConfigs->isEmpty()) {
            return null;
        }

        // Match by size if available, otherwise take the general/first matching category entry
        $categoryConfig = null;
        if (! empty($size)) {
            $categoryConfig = $printleyConfigs->first(function ($item) use ($size) {
                return ! empty($item['size']) && strcasecmp(trim($item['size']), trim($size)) === 0;
            });
        }

        if (! $categoryConfig) {
            $categoryConfig = $printleyConfigs->first(function ($item) {
                return empty($item['size']) || $item['size'] === '상관 없음';
            }) ?? $printleyConfigs->first();
        }

        if (! $categoryConfig) {
            return null;
        }

        $boxRange = $categoryConfig['box_shipping_fee_range'] ?? null;
        if (! $boxRange) {
            return null;
        }

        $boxIds = $this->parseBoxRange($boxRange);
        if (empty($boxIds)) {
            return null;
        }

        $boxes = config('shipping_fee.boxes', []);
        $selectedBox = null;

        foreach ($boxIds as $boxId) {
            $candidate = collect($boxes)->firstWhere('id', $boxId);
            if (! $candidate) {
                continue;
            }

            // If box has a max weight, check if it can hold the product weight
            if ($candidate['weight_kg'] !== null) {
                if ($candidate['weight_kg'] >= $weightProduct) {
                    $selectedBox = $candidate;
                    break;
                }
            } else {
                // If weight_kg is not set (e.g. envelope or banner tube), pick as valid candidate
                $selectedBox = $candidate;
                break;
            }
        }

        // Fallback to the largest box in the range if weight exceeded all
        if (! $selectedBox) {
            $lastBoxId = end($boxIds);
            $selectedBox = collect($boxes)->firstWhere('id', $lastBoxId);
        }

        if (! $selectedBox) {
            return null;
        }

        $boxFee = (int) ($selectedBox['charge_won'] ?? $selectedBox['hanjin_freight_won'] ?? 3000);
        $moq = max(1, (int) ($selectedBox['moq_pieces'] ?? 1));

        // Box count = ceil(quantity / MOQ) * case
        $boxesPerCase = max(1, (int) ceil($quantity / $moq));
        $totalBoxes = $boxesPerCase * max(1, $case);

        return $totalBoxes * $boxFee;
    }

    /**
     * Resolve Courier / Direct (택배/직배송) shipping fee based on Sheet 4 & regional surcharges.
     */
    public function resolveCourierShippingFee(
        ?User $user,
        float $subtotal,
        Product $product,
        ?string $postcode = null
    ): ?int {
        // 1. Separate shipping fee from product has highest priority if configured
        if ($product->requires_separate_shipping && $product->separate_shipping_fee !== null) {
            $baseFee = (int) $product->separate_shipping_fee;
        } elseif ($product->separate_shipping_fee !== null && $product->separate_shipping_fee > 0) {
            $baseFee = (int) $product->separate_shipping_fee;
        } else {
            $categoryName = $product->category?->name;
            $storeRates = config('shipping_fee.store.rates', []);
            $matchedRate = null;

            if ($categoryName) {
                foreach ($storeRates as $rate) {
                    if (in_array($categoryName, $rate['categories'] ?? [], true)) {
                        $matchedRate = $rate;
                        break;
                    }
                }
            }

            $baseFee = $matchedRate
                ? (int) $matchedRate['standard_fee']
                : (int) config('shipping_fee.store.default_fee', 3500);
        }

        // 3. Regional Surcharge (Jeju / Remote Islands)
        $surcharge = $this->calculateRegionalSurcharge($postcode);

        return max(0, $baseFee + $surcharge);
    }

    /**
     * Calculate surcharge for Jeju island and isolated island regions.
     */
    public function calculateRegionalSurcharge(?string $postcode): int
    {
        if (empty($postcode)) {
            return 0;
        }

        $cleanPostcode = trim($postcode);
        $numericPostcode = (int) preg_replace('/\D/', '', $cleanPostcode);

        // Jeju check (63000 ~ 63644)
        $jeju = config('shipping_fee.store.regions.jeju', ['min_postcode' => 63000, 'max_postcode' => 63644]);
        if ($numericPostcode >= $jeju['min_postcode'] && $numericPostcode <= $jeju['max_postcode']) {
            return (int) config('shipping_fee.store.default_jeju_surcharge', 3500);
        }

        // Island / remote postal code prefix check
        $islandPrefixes = config('shipping_fee.store.regions.island_prefixes', []);
        foreach ($islandPrefixes as $prefix) {
            if (str_starts_with($cleanPostcode, (string) $prefix)) {
                return (int) config('shipping_fee.store.default_island_surcharge', 4000);
            }
        }

        return 0;
    }

    /**
     * Check if Free Shipping Date Range campaign is active.
     */
    public function isFreeShippingCampaignActive(): bool
    {
        return ShippingSetting::isFreeShippingActive();
    }

    /**
     * Check if user is eligible for free shipping via membership tier or B2B customer threshold.
     */
    public function isUserEligibleForFreeShipping(?User $user, float $subtotal): bool
    {
        if (! $user) {
            return false;
        }

        // B2B Customer threshold
        if ($user->customer_id && $user->customer) {
            $customerMin = $user->customer->free_shipping_min_order_amount;
            if ($customerMin !== null && $customerMin !== '' && $subtotal >= (float) $customerMin) {
                return true;
            }
        }

        // B2C Membership tier threshold
        if ($user->membershipTier) {
            if ($user->membershipTier->has_free_shipping) {
                return true;
            }
            $tierMin = $user->membershipTier->free_shipping_min_amount;
            if ($tierMin !== null && $subtotal >= (float) $tierMin) {
                return true;
            }
        }

        return false;
    }

    /**
     * Legacy helper method for backward compatibility.
     */
    public function resolveShippingFee(?User $user, float $subtotal, Product $product, int|float $weightProduct): ?int
    {
        return $this->resolveQuickShippingFee($user, $subtotal, $product, $weightProduct);
    }

    /**
     * Legacy helper method for customer shipping.
     */
    public function resolveShippingFromCustomer(?User $user, float $subtotal, Product $product): ?int
    {
        if ($user === null || $user->customer_id === null) {
            return null;
        }

        return $product->separate_shipping_fee;
    }

    /**
     * Parse box range string like '⑤~⑨' into array of box ids ['⑤', '⑥', '⑦', '⑧', '⑨'].
     */
    private function parseBoxRange(string $range): array
    {
        if (! str_contains($range, '~')) {
            return [$range];
        }

        [$start, $end] = explode('~', $range);

        $orderedIds = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '10', '11', '⑫-1', '⑫-2'];

        $startIndex = array_search(trim($start), $orderedIds, true);
        $endIndex = array_search(trim($end), $orderedIds, true);

        if ($startIndex === false || $endIndex === false || $startIndex > $endIndex) {
            return [trim($start)];
        }

        return array_slice($orderedIds, $startIndex, $endIndex - $startIndex + 1);
    }
}
