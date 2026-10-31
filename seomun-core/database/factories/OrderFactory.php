<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\UserAuthority;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 50000, 150000);
        $shippingFee = $this->faker->randomFloat(2, 0, 5000);

        return [
            'order_number' => 'ORD-'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
            'user_id' => User::factory()->new()->userAuthority(UserAuthority::USER)->customer(),
            'product_id' => Product::factory(),
            'design_mode_code' => 'web_editor',
            'product_name' => $this->faker->words(3, true),
            'design_mode_name' => null,
            'status' => OrderStatus::Pending->value,
            'payment_status' => 'pending',
            'currency' => 'KRW',
            'subtotal_amount' => $subtotal,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'shipping_fee' => $shippingFee,
            'total_amount' => $subtotal + $shippingFee,
            'estimated_production_days' => 3,
            'requested_delivery_date' => now()->addDays(5),
            'placed_at' => now(),
            'contact_name' => $this->faker->name(),
            'contact_phone' => $this->faker->phoneNumber(),
            'contact_phone2' => $this->faker->phoneNumber(),
            'contact_tel' => $this->faker->phoneNumber(),
            'contact_email' => $this->faker->safeEmail(),
            'company_name' => $this->faker->company(),
            'shipping_name' => $this->faker->name(),
            'shipping_phone' => $this->faker->phoneNumber(),
            'shipping_postcode' => $this->faker->postcode(),
            'shipping_address' => $this->faker->streetAddress(),
            'shipping_address_detail' => $this->faker->secondaryAddress(),
            'customer_note' => $this->faker->sentence(),
            'selected_options' => [],
            'metadata' => [],
        ];
    }
}
