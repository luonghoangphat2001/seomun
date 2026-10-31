<?php

namespace Database\Factories;

use App\Models\AddressBook;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AddressBook>
 */
class AddressBookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->company().'점',
            'recipient' => fake()->name(),
            'phone' => '02-'.fake()->numerify('####-####'),
            'mobile' => '010-'.fake()->numerify('####-####'),
            'postcode' => fake()->numerify('#####'),
            'address' => fake()->address(),
            'detailed_address' => fake()->secondaryAddress(),
            'is_default' => false,
        ];
    }

    /**
     * Indicate that the address is default.
     */
    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }
}
