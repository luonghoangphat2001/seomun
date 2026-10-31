<?php

namespace Database\Factories;

use App\Models\Popup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Popup>
 */
class PopupFactory extends Factory
{
    protected $model = Popup::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'content' => '<p>' . fake()->paragraph() . '</p>',
            'image_path' => null,
            'exposure_target' => ['all'],
            'exposure_location' => fake()->randomElement(['main', 'login', 'dashboard']),
            'width' => 500,
            'height' => 400,
            'is_active' => true,
            'exposure_start_date' => now()->subDay(),
            'exposure_end_date' => now()->addDays(7),
            'created_by' => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'exposure_start_date' => now()->subDays(10),
            'exposure_end_date' => now()->subDays(1),
        ]);
    }

    public function upcoming(): static
    {
        return $this->state(fn (array $attributes) => [
            'exposure_start_date' => now()->addDays(2),
            'exposure_end_date' => now()->addDays(10),
        ]);
    }

    public function forLocation(string $location): static
    {
        return $this->state(fn (array $attributes) => [
            'exposure_location' => $location,
        ]);
    }

    public function forCustomers(array $customerIds): static
    {
        return $this->state(fn (array $attributes) => [
            'exposure_target' => $customerIds,
        ]);
    }
}
