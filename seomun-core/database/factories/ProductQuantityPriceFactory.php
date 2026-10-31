<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductQuantityPrice;
use App\Models\QuantityPriceTier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductQuantityPrice>
 */
class ProductQuantityPriceFactory extends Factory
{
    protected $model = ProductQuantityPrice::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'quantity_price_tier_id' => QuantityPriceTier::factory(),
            'price' => $this->faker->randomFloat(2, 10000, 100000),
            'currency' => 'KRW',
            'production_days' => $this->faker->numberBetween(1, 5),
            'is_default' => false,
        ];
    }
}
