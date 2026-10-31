<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductDesignMode;
use App\Models\ProductOption;
use App\Models\ProductOptionGroup;
use App\Models\ProductQuantityPrice;
use App\Models\ProductSpecification;
use Illuminate\Database\Seeder;

/**
 * Clone specification, option_groups+options, quantity_prices, design_modes
 * from product id 1 to all other products (id 2..21).
 * Run once: php artisan db:seed --class=SyncProductExtrasFromFirstProductSeeder
 */
class SyncProductExtrasFromFirstProductSeeder extends Seeder
{
    private const SOURCE_PRODUCT_ID = 1;

    private const TARGET_PRODUCT_IDS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

    public function run(): void
    {
        $source = Product::find(self::SOURCE_PRODUCT_ID);
        if (! $source) {
            $this->command->warn('Product id '.self::SOURCE_PRODUCT_ID.' not found. Skip.');

            return;
        }

        $targetIds = collect(self::TARGET_PRODUCT_IDS)->filter(function ($id) {
            return Product::where('id', $id)->exists();
        })->values()->all();

        if (empty($targetIds)) {
            $this->command->warn('No target products found. Skip.');

            return;
        }

        foreach ($targetIds as $targetId) {
            $this->cloneExtrasFromTo($source->id, $targetId);
        }

        $this->command->info('Synced extras from product '.self::SOURCE_PRODUCT_ID.' to '.count($targetIds).' product(s).');
    }

    private function cloneExtrasFromTo(int $sourceProductId, int $targetProductId): void
    {
        $spec = ProductSpecification::where('product_id', $sourceProductId)->first();
        if ($spec) {
            ProductSpecification::updateOrCreate(
                ['product_id' => $targetProductId],
                array_merge($spec->only([
                    'size_width_mm', 'size_height_mm', 'size_unit',
                    'paper_type', 'paper_weight_gsm', 'print_side',
                    'coating', 'corner_finish', 'production_time_days', 'notes',
                ]), ['product_id' => $targetProductId])
            );
        }

        $groups = ProductOptionGroup::where('product_id', $sourceProductId)->orderBy('sort_order')->get();
        $targetGroupIds = ProductOptionGroup::where('product_id', $targetProductId)->pluck('id');
        if ($targetGroupIds->isNotEmpty()) {
            ProductOption::whereIn('option_group_id', $targetGroupIds)->delete();
        }
        ProductOptionGroup::where('product_id', $targetProductId)->delete();
        foreach ($groups as $group) {
            $options = $group->options()->orderBy('sort_order')->get();
            $newGroup = ProductOptionGroup::create([
                'product_id' => $targetProductId,
                'code' => $group->code,
                'name' => $group->name,
                'display_type' => $group->display_type,
                'is_required' => $group->is_required,
                'sort_order' => $group->sort_order,
            ]);
            foreach ($options as $opt) {
                ProductOption::create([
                    'option_group_id' => $newGroup->id,
                    'label' => $opt->label,
                    'value' => $opt->value,
                    'additional_price' => $opt->additional_price,
                    'metadata' => $opt->metadata,
                    'sort_order' => $opt->sort_order,
                    'is_active' => $opt->is_active ?? true,
                ]);
            }
        }

        $prices = ProductQuantityPrice::where('product_id', $sourceProductId)
            ->orderByRaw('(
                select quantity from quantity_price_tiers
                where quantity_price_tiers.id = product_quantity_prices.quantity_price_tier_id
                limit 1
            )')
            ->get();
        ProductQuantityPrice::where('product_id', $targetProductId)->delete();

        $targetProduct = Product::find($targetProductId);

        foreach ($prices as $p) {
            $price = $p->price;
            if ($targetProduct && $targetProduct->price !== null) {
                // Same tier ids; scale price by target product base price (legacy behaviour).
                $price = $targetProduct->price;
            }

            ProductQuantityPrice::create([
                'product_id' => $targetProductId,
                'quantity_price_tier_id' => $p->quantity_price_tier_id,
                'price' => $price,
                'currency' => $p->currency ?? 'KRW',
                'production_days' => $p->production_days,
                'is_default' => $p->is_default ?? false,
            ]);
        }

        $modes = ProductDesignMode::where('product_id', $sourceProductId)->where('is_active', true)->orderBy('sort_order')->get();
        ProductDesignMode::where('product_id', $targetProductId)->delete();
        foreach ($modes as $m) {
            ProductDesignMode::create([
                'product_id' => $targetProductId,
                'code' => $m->code,
                'name' => $m->name,
                'description' => $m->description,
                'is_active' => true,
                'sort_order' => $m->sort_order,
                'metadata' => $m->metadata,
            ]);
        }
    }
}
