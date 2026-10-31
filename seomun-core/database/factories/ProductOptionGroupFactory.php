<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductOptionGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductOptionGroup>
 */
class ProductOptionGroupFactory extends Factory
{
    protected $model = ProductOptionGroup::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'code' => $this->faker->unique()->slug(2),
            'name' => $this->faker->words(2, true),
            'display_type' => 'select',
            'is_required' => $this->faker->boolean(50),
            'sort_order' => $this->faker->numberBetween(0, 10),
        ];
    }
}
