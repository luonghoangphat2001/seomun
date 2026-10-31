<?php

namespace Database\Seeders;

use App\Models\BundleTier;
use App\Models\Product;
use App\Models\ProductQuantityPrice;
use App\Models\QuantityPriceTier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductQuantityPricesTierSeeder extends Seeder
{
    /**
     * Seed pivot rows for every product × quantity tier × bundle tier.
     */
    public function run(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=OFF');
        }

        DB::table('product_quantity_prices')->truncate();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=ON');
        }

        $tiers = QuantityPriceTier::query()
            ->where('unit', 'sheets')
            ->orderBy('sort_order')
            ->get();
        $bundleTiers = BundleTier::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        foreach (Product::query()->get(['id', 'price']) as $product) {
            // Interpret `products.price` as the "base price for 50 sheets".
            // This becomes the anchor for generating other quantity tiers.
            $basePrice50 = (float) ($product->price ?? 0);
            if ($basePrice50 <= 0) {
                $basePrice50 = 10000;
            }

            $baseUnitPrice = $basePrice50 / 50;

            foreach ($tiers as $tier) {
                $q = (int) $tier->quantity;
                $quantityScale = pow((50 / max(1, $q)), 0.2);
                $perCasePrice = $baseUnitPrice * $q * $quantityScale;
                $price = round(max(0, $perCasePrice), 2);

                $productionDays = match (true) {
                    $q >= 200 => 3,
                    $q >= 50 => 4,
                    $q >= 30 => 4,
                    $q >= 20 => 5,
                    default => 6,
                };

                ProductQuantityPrice::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'quantity' => $q,
                    ],
                    [
                        'unit' => $tier->unit ?? '매',
                        'price' => $price,
                        'currency' => 'KRW',
                        'production_days' => $productionDays,
                    ]
                );
            }
        }

        $this->command->info('Product quantity price pivots seeded from quantity_price_tiers master.');
    }
}
