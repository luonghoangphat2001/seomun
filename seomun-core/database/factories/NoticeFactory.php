<?php

namespace Database\Factories;

use App\Models\Notice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notice>
 */
class NoticeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['orders', 'product_news', 'service', 'events', 'shipping_delivery', 'other'];

        return [
            'title' => fake()->sentence(4),
            'content' => fake()->paragraph(5),
            'type' => fake()->randomElement($types),
            'is_pinned' => false,
            'is_active' => true,
            'view_count' => fake()->numberBetween(0, 1000),
            'published_at' => now(),
            'expires_at' => null,
        ];
    }

    /**
     * Indicate that the notice is pinned.
     */
    public function pinned(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_pinned' => true,
        ]);
    }

    /**
     * Indicate that the notice is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the notice is an order notice.
     */
    public function important(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'orders',
            'is_pinned' => true,
        ]);
    }

    /**
     * Indicate that the notice has expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'published_at' => now()->subDays(10),
            'expires_at' => now()->subDay(),
        ]);
    }

    /**
     * Indicate that the notice is scheduled for future.
     */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'published_at' => now()->addDay(),
        ]);
    }
}
