<?php

namespace Database\Factories;

use App\Models\VerificationCode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VerificationCode>
 */
class VerificationCodeFactory extends Factory
{
    protected $model = VerificationCode::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'identifier' => fake()->safeEmail(),
            'type' => fake()->randomElement(['email', 'mobile']),
            'code' => str_pad((string) rand(100000, 999999), 6, '0', STR_PAD_LEFT),
            'purpose' => 'find_username',
            'attempts' => 0,
            'max_attempts' => 5,
            'expires_at' => now()->addMinutes(10),
            'verified_at' => null,
        ];
    }

    public function email(): static
    {
        return $this->state(fn () => [
            'type' => 'email',
            'identifier' => fake()->safeEmail(),
        ]);
    }

    public function mobile(): static
    {
        return $this->state(fn () => [
            'type' => 'mobile',
            'identifier' => '010-'.fake()->numerify('####-####'),
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn () => [
            'verified_at' => now(),
        ]);
    }

    public function resetPassword(): static
    {
        return $this->state(fn () => [
            'purpose' => 'reset_password',
        ]);
    }
}
