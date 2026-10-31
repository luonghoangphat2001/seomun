<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductOption;
use App\Models\ProductOptionGroup;
use App\Models\ProductQuantityPrice;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductOptionsSeeder extends Seeder
{
    /**
     * Seed product_option_groups + product_options for all products.
     *
     * Design goals:
     * - Compact: generate option groups from templates.
     * - Consistent: keep option_group code aligned with OrderService quote mapping.
     * - Reasonable prices: additional_price is derived from the cheapest quantity tier (fallback to product.price).
     */
    public function run(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=OFF');
        }

        // Truncate child table first.
        DB::table('product_options')->truncate();
        DB::table('product_option_groups')->truncate();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=ON');
        }

        $products = Product::query()->where('is_active', true)->get(['id', 'price']);

        $groupTemplates = [
            [
                'code' => 'paper_stock',
                'name' => 'Paper Stock',
                'display_type' => 'select',
                'is_required' => true,
                'sort_order' => 1,
                'options' => [
                    ['label' => 'Paper Base', 'value' => 'paper_base', 'factor' => 0.00],
                    ['label' => 'Paper Premium A', 'value' => 'paper_premium_a', 'factor' => 0.12],
                    ['label' => 'Paper Premium B', 'value' => 'paper_premium_b', 'factor' => 0.22],
                ],
            ],
            [
                'code' => 'coating',
                'name' => 'Coating',
                'display_type' => 'radio',
                'is_required' => true,
                'sort_order' => 2,
                'options' => [
                    ['label' => 'No Coating', 'value' => 'coating_none', 'factor' => 0.00],
                    ['label' => 'Matte Coating', 'value' => 'coating_matte', 'factor' => 0.08],
                    ['label' => 'Glossy Coating', 'value' => 'coating_glossy', 'factor' => 0.14],
                ],
            ],
            [
                'code' => 'corner_finish',
                'name' => 'Corner Finish',
                'display_type' => 'radio',
                'is_required' => false,
                'sort_order' => 3,
                'options' => [
                    ['label' => 'Square (Default)', 'value' => 'corner_square', 'factor' => 0.00],
                    ['label' => 'Rounded', 'value' => 'corner_rounded', 'factor' => 0.10],
                    ['label' => 'Rounded +', 'value' => 'corner_rounded_plus', 'factor' => 0.20],
                ],
            ],
        ];

        foreach ($products as $product) {
            // additional_price should be in the same ballpark as quantity_price->price.
            $baseUnit = (float) ProductQuantityPrice::query()
                ->where('product_id', $product->id)
                ->min('price');

            if ($baseUnit <= 0) {
                $baseUnit = (float) ($product->price ?? 0);
            }

            // Avoid zero price causing all additional prices to be 0.
            if ($baseUnit <= 0) {
                $baseUnit = 10000;
            }

            foreach ($groupTemplates as $groupIdx => $groupTemplate) {
                $group = ProductOptionGroup::create([
                    'product_id' => $product->id,
                    'code' => $groupTemplate['code'],
                    'name' => $groupTemplate['name'],
                    'display_type' => $groupTemplate['display_type'],
                    'is_required' => (bool) $groupTemplate['is_required'],
                    'sort_order' => (int) $groupTemplate['sort_order'],
                ]);

                foreach ($groupTemplate['options'] as $optIdx => $optTemplate) {
                    $additionalPrice = round($baseUnit * (float) $optTemplate['factor'], 2);
                    if ($additionalPrice < 0) {
                        $additionalPrice = 0;
                    }

                    ProductOption::create([
                        'option_group_id' => $group->id,
                        'label' => $optTemplate['label'],
                        'value' => $optTemplate['value'],
                        'additional_price' => $additionalPrice,
                        'metadata' => null,
                        'sort_order' => (int) $optIdx,
                        'is_active' => true,
                    ]);
                }
            }
        }

        $this->command->info('Product options seeded successfully.');
        $this->command->info('Truncated and regenerated: product_option_groups + product_options.');
    }
}
