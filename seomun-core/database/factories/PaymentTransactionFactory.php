<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\OrderItem;
use App\Models\PaymentTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentTransaction>
 */
class PaymentTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $paymentMethod = PaymentMethod::cases()[array_rand(PaymentMethod::cases())]->value;
        $paymentStatus = PaymentStatus::cases()[array_rand(PaymentStatus::cases())]->value;

        return [
            'order_id' => OrderItem::factory()->create()->order->id,
            'transaction_id' => 'TXN-'.now()->format('YmdHis').'-'.strtoupper(fake()->lexify('????????')),
            'pg_transaction_id' => 'PG-'.strtoupper(fake()->lexify('??????????')),
            'payment_method' => $paymentMethod,
            'status' => $paymentStatus,
            'amount' => fake()->randomFloat(2, 10000, 500000),
            'currency' => 'KRW',
            'pg_name' => fake()->randomElement(['KG Inicis', 'Toss Payments', 'Naver Pay', 'Kakao Pay']),
            'card_name' => fake()->optional()->randomElement(['신한카드', 'KB국민카드', '삼성카드', '현대카드']),
            'card_number' => fake()->optional()->numerify('****-****-****-####'),
            'virtual_account_number' => fake()->optional()->numerify('##########'),
            'virtual_account_bank' => fake()->optional()->randomElement(['신한은행', '국민은행', '우리은행']),
            'virtual_account_expires_at' => fake()->optional()->dateTimeBetween('now', '+7 days'),
            'bank_account_holder' => fake()->optional()->name(),
            'paid_at' => $this->faker->optional()->dateTimeBetween('now', '+7 days') ?? null,
            'failed_at' => $this->faker->optional()->dateTimeBetween('now', '+7 days') ?? null,
            'refunded_at' => $this->faker->optional()->dateTimeBetween('now', '+7 days') ?? null,
            'metadata' => null,
        ];
    }

    /**
     * Indicate that the payment is paid
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::PAID->value,
            'paid_at' => $this->faker->dateTimeBetween('now', '+7 days') ?? null,
        ]);
    }

    /**
     * Indicate that the payment is pending
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::PENDING->value,
            'paid_at' => $this->faker->dateTimeBetween('now', '+7 days') ?? null,
        ]);
    }

    /**
     * Indicate that the payment failed
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::FAILED->value,
            'failed_at' => $this->faker->dateTimeBetween('now', '+7 days') ?? null,
        ]);
    }
}
