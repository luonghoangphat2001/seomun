<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductDesignMode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductDesignMode>
 */
class ProductDesignModeFactory extends Factory
{
    protected $model = ProductDesignMode::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'code' => $this->faker->unique()->slug(2),
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(0, 10),
            'metadata' => ['type' => $this->faker->randomElement(['general', 'custom'])],
        ];
    }
}
