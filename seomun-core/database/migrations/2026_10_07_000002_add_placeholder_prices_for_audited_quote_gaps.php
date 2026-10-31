<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The user approved placeholder pricing for the remaining audited quote gaps.
     * Keep the values deliberately minimal and only fill missing quantity coverage.
     */
    private const PLACEHOLDER_PRICE = 1;

    private const TARGET_QUANTITY = 100;

    public function up(): void
    {
        DB::transaction(function (): void {
            $profile = DB::table('pricing_profiles')
                ->where('code', 'LEGACY_UNIT_TIER')
                ->where('is_active', true)
                ->first();

            if (! $profile) {
                throw new RuntimeException('An active LEGACY_UNIT_TIER pricing profile is required.');
            }

            $this->addPlaceholderTiers(29, 'square-sticker');
            $this->addPlaceholderTiers(38, 'master-envelope');

            // Form Paper and Standard Banner have no product-specific unit-price rows.
            // Their audited configurations get a wildcard 1/1 unit rate so the active
            // Unit Tier calculator can quote every selected size and paper option.
            foreach ([
                36 => 'form-paper',
                40 => 'standard-banner',
            ] as $productId => $slug) {
                $product = DB::table('products')
                    ->where('id', $productId)
                    ->where('slug', $slug)
                    ->whereNull('deleted_at')
                    ->first();

                if (! $product) {
                    throw new RuntimeException("Expected product {$productId} ({$slug}) was not found.");
                }

                $rule = DB::table('unit_prices')
                    ->where('product_id', $productId)
                    ->whereNull('erp_size_option_id')
                    ->whereNull('erp_paper_option_id')
                    ->whereNull('erp_subject_master_option_id')
                    ->whereNull('combination_options')
                    ->where('is_active', true)
                    ->whereNull('deleted_at')
                    ->orderBy('id')
                    ->first();

                if (! $rule) {
                    $ruleId = DB::table('unit_prices')->insertGetId([
                        'product_id' => $productId,
                        'product_type' => null,
                        'combination_options' => null,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    $ruleId = $rule->id;
                }

                $this->ensurePlaceholderTier((int) $ruleId, 1);

                DB::table('products')->where('id', $productId)->update([
                    'pricing_profile_id' => $profile->id,
                    'pricing_structure' => 'single',
                    'updated_at' => now(),
                ]);
            }
        });
    }

    private function addPlaceholderTiers(int $productId, string $slug): void
    {
        $product = DB::table('products')
            ->where('id', $productId)
            ->where('slug', $slug)
            ->whereNull('deleted_at')
            ->first();

        if (! $product) {
            throw new RuntimeException("Expected product {$productId} ({$slug}) was not found.");
        }

        $rules = DB::table('unit_prices')
            ->where('product_id', $productId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->get(['id']);

        if ($rules->isEmpty()) {
            throw new RuntimeException("Product {$productId} has no active unit-price rules to fill.");
        }

        foreach ($rules as $rule) {
            $covered = DB::table('unit_price_items')
                ->where('unit_price_id', $rule->id)
                ->where('quantity_min', '<=', self::TARGET_QUANTITY)
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->where('price_value', '>', 0)
                ->exists();

            if (! $covered) {
                $this->ensurePlaceholderTier((int) $rule->id, self::TARGET_QUANTITY);
            }
        }
    }

    private function ensurePlaceholderTier(int $unitPriceId, int $quantity): void
    {
        $tier = DB::table('unit_price_items')
            ->where('unit_price_id', $unitPriceId)
            ->where('quantity_min', $quantity)
            ->first();

        $values = [
            'price_value' => self::PLACEHOLDER_PRICE,
            'raw_cost' => self::PLACEHOLDER_PRICE,
            'is_active' => true,
            'deleted_at' => null,
            'updated_at' => now(),
        ];

        if ($tier) {
            DB::table('unit_price_items')->where('id', $tier->id)->update($values);

            return;
        }

        DB::table('unit_price_items')->insert($values + [
            'unit_price_id' => $unitPriceId,
            'quantity_min' => $quantity,
            'attributes' => null,
            'created_at' => now(),
        ]);
    }

    public function down(): void
    {
        // Keep user-approved placeholder prices and product assignments on rollback.
    }
};
