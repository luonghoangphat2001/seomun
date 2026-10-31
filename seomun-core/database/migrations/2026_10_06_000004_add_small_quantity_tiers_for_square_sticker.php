<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $productId = DB::table('products')->where('slug', 'square-sticker')->value('id');
            if (! $productId) {
                return;
            }

            $rules = DB::table('unit_prices')
                ->where('product_id', $productId)
                ->where('is_active', true)
                ->get(['id']);

            foreach ($rules as $rule) {
                if (DB::table('unit_price_items')
                    ->where('unit_price_id', $rule->id)
                    ->where('quantity_min', 100)
                    ->whereNull('deleted_at')
                    ->exists()) {
                    continue;
                }

                $base = DB::table('unit_price_items')
                    ->where('unit_price_id', $rule->id)
                    ->where('quantity_min', 500)
                    ->where('is_active', true)
                    ->whereNull('deleted_at')
                    ->first();
                if (! $base) {
                    continue;
                }

                DB::table('unit_price_items')->insert([
                    'unit_price_id' => $rule->id,
                    'quantity_min' => 100,
                    'price_value' => (int) round($base->price_value * 100 / 500),
                    'raw_cost' => (int) round($base->raw_cost * 100 / 500),
                    'attributes' => $base->attributes,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });
    }

    public function down(): void
    {
        // Keep migrated pricing data intact on rollback.
    }
};
