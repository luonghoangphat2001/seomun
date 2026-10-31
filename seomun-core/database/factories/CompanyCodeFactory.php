<?php

namespace Database\Factories;

use App\Models\CompanyCode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CompanyCode>
 */
class CompanyCodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->bothify('COMP-####-####')),
            'company_name' => fake()->company().' 그래픽스',
            'is_active' => true,
            'usage_count' => 0,
            'max_usage' => null,
            'expires_at' => null,
        ];
    }

    /**
     * Indicate that the code is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the code has expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->subDay(),
        ]);
    }

    /**
     * Indicate that the code has reached max usage.
     */
    public function maxUsageReached(int $maxUsage = 10): static
    {
        return $this->state(fn (array $attributes) => [
            'max_usage' => $maxUsage,
            'usage_count' => $maxUsage,
        ]);
    }

    /**
     * Indicate that the code will expire in the future.
     */
    public function expiresInFuture(int $days = 30): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->addDays($days),
        ]);
    }
}
