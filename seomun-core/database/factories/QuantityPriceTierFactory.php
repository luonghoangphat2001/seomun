<?php

namespace Database\Factories;

use App\Models\QuantityPriceTier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuantityPriceTier>
 */
class QuantityPriceTierFactory extends Factory
{
    protected $model = QuantityPriceTier::class;

    public function definition(): array
    {
        $qty = $this->faker->randomElement([10, 20, 30, 50, 200]);

        return [
            'quantity' => $qty,
            'unit' => 'sheets',
            'sort_order' => $qty,
            'is_active' => true,
        ];
    }
}
