<?php

namespace Database\Factories;

use App\Models\HomeSection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HomeSection>
 */
class HomeSectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['banner', 'popular_products', 'category_icons', 'recent_orders', 'notices', 'custom'];

        return [
            'type' => fake()->randomElement($types),
            'title' => fake()->sentence(3),
            'subtitle' => fake()->optional()->sentence(2),
            'content' => null,
            'image' => fake()->optional()->imageUrl(),
            'link' => fake()->optional()->url(),
            'sort_order' => fake()->numberBetween(0, 100),
            'is_active' => true,
            'starts_at' => null,
            'ends_at' => null,
            'metadata' => null,
        ];
    }

    /**
     * Indicate that the section is a banner.
     */
    public function banner(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'banner',
            'title' => '셀프디자인 오픈!',
            'subtitle' => '명함부터 시작합니다!',
            'image' => fake()->imageUrl(1200, 400),
            'link' => '/products',
            'sort_order' => 1,
        ]);
    }

    /**
     * Indicate that the section is for popular products.
     */
    public function popularProducts(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'popular_products',
            'title' => '인기상품',
            'sort_order' => 2,
            'metadata' => [
                'limit' => 8,
                'show_price' => true,
            ],
        ]);
    }

    /**
     * Indicate that the section is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the section has time constraints.
     */
    public function withTimeConstraints(): static
    {
        return $this->state(fn (array $attributes) => [
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDays(7),
        ]);
    }

    /**
     * Indicate that the section has expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'starts_at' => now()->subDays(10),
            'ends_at' => now()->subDay(),
        ]);
    }
}
