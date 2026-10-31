<?php

namespace Database\Factories;

use App\Models\ProductOption;
use App\Models\ProductOptionGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductOption>
 */
class ProductOptionFactory extends Factory
{
    protected $model = ProductOption::class;

    public function definition(): array
    {
        return [
            'option_group_id' => ProductOptionGroup::factory(),
            'label' => $this->faker->words(2, true),
            'value' => $this->faker->slug(),
            'additional_price' => $this->faker->randomFloat(2, 0, 5000),
            'metadata' => ['color' => $this->faker->safeColorName()],
            'sort_order' => $this->faker->numberBetween(0, 10),
            'is_active' => true,
        ];
    }
}
