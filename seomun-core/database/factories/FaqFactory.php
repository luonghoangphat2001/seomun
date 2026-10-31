<?php

namespace Database\Factories;

use App\Enums\FaqCategory;
use App\Models\Faq;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Faq>
 */
class FaqFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = FaqCategory::cases();

        return [
            'category' => fake()->randomElement($categories)->value,
            'question' => fake()->sentence(8).'?',
            'answer' => fake()->paragraph(3),
            'sort_order' => fake()->numberBetween(0, 100),
            'is_active' => true,
            'view_count' => fake()->numberBetween(0, 500),
        ];
    }

    /**
     * Indicate that the FAQ is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the FAQ belongs to a specific category.
     */
    public function ofCategory(string $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => $category,
        ]);
    }
}
