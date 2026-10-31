<?php

namespace Database\Factories;

use App\Models\LimitUsagedLogs;
use App\Models\Order;
use App\Models\UserLimit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LimitUsagedLogs>
 */
class LimitUsagedLogsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_limit_id' => UserLimit::inRandomOrder()->first()->id,
            'reference_type' => Order::class,
            'reference_id' => Order::inRandomOrder()->first()->id,
            'usage_amount' => fake()->randomNumber(2),
            'remaining_amount' => fake()->randomNumber(2),
            'description' => fake()->sentence(),
        ];
    }
}
