<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ShippingFeeType;
use App\Enums\ShippingMethod;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = FakerFactory::create();
        // Get or create a test user
        $user = User::first();
        if (! $user) {
            $this->command->warn('No users found. Please run UserSeeder or create a user first.');

            return;
        }

        // Get products (need at least 1 product)
        $products = Product::take(3)->get();
        if ($products->isEmpty()) {
            $this->command->warn('No products found. Please run ProductSeeder first.');

            return;
        }

        $orderStatuses = [
            OrderStatus::Pending,
            OrderStatus::Confirmed,
            OrderStatus::InProduction,
            OrderStatus::ReadyToShip,
            OrderStatus::Shipped,
            OrderStatus::Completed,
            OrderStatus::Cancelled,
        ];

        $paymentStatuses = [
            PaymentStatus::PENDING,
            PaymentStatus::PROCESSING,
            PaymentStatus::PAID,
            PaymentStatus::FAILED,
            PaymentStatus::CANCELLED,
        ];

        // Create orders with different statuses and dates
        $orders = [];

        // Create orders for the last 3 months with various statuses
        foreach ($orderStatuses as $index => $status) {
            $product = $products->random();
            $paymentStatus = $paymentStatuses[array_rand($paymentStatuses)];

            $createdAt = now()->subMonths(2)->addDays($index * 3);
            $placedAt = $createdAt->copy()->addHours(2);

            $subtotal = $faker->randomFloat(2, 50000, 200000);
            $shippingFee = $faker->randomFloat(2, 0, 5000);
            $tax = $subtotal * 0.1;
            $total = $subtotal + $shippingFee + $tax;

            $orderNumber = 'P'.now()->format('Ymd').'-'.strtoupper(Str::random(6));

            $order = Order::create([
                'order_number' => $orderNumber,
                'order_external_number' => 'EXT-'.$index + 1,
                'user_id' => $user->id,
                'product_id' => $product->id,
                'design_mode_code' => 'upload_file',
                'product_name' => $product->name,
                'status' => $status->value,
                'payment_status' => $paymentStatus->value,
                'currency' => 'KRW',
                'subtotal_amount' => $subtotal,
                'discount_amount' => 0,
                'tax_amount' => $tax,
                'shipping_fee' => $shippingFee,
                'total_amount' => $total,
                'estimated_production_days' => $faker->numberBetween(3, 7),
                'requested_delivery_date' => $placedAt->copy()->addDays(5),
                'placed_at' => $placedAt,
                'contact_name' => $user->name,
                'contact_phone' => $user->phone ?? '01012345678',
                'contact_phone2' => '',
                'contact_tel' => '',
                'contact_email' => $user->email,
                'company_name' => $faker->company(),
                'shipping_name' => $user->name,
                'shipping_phone' => $user->phone ?? '01012345678',
                'shipping_postcode' => $faker->postcode(),
                'shipping_address' => $faker->streetAddress(),
                'shipping_address_detail' => $faker->secondaryAddress(),
                'shipping_method' => ShippingMethod::COURIER,
                'shipping_fee_type' => ShippingFeeType::PAYMENT,
                'customer_note' => $faker->optional(0.5)->sentence(),
                'selected_options' => [],
                'metadata' => [],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Create order items
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'title' => '50매',
                'quantity' => 50,
                'multiplier' => 1,
                'unit' => '매',
                'production_days' => 3,
                'unit_price' => $subtotal / 50,
                'total_price' => $subtotal,
                'configuration' => [
                    'unit_label' => '50매',
                ],
                'notes' => null,
            ]);

            $orders[] = $order;
        }

        // Create additional orders with same status but different dates for filtering tests
        foreach ([OrderStatus::Confirmed, OrderStatus::Shipped, OrderStatus::Completed] as $status) {
            for ($i = 0; $i < 2; $i++) {
                $product = $products->random();
                $paymentStatus = PaymentStatus::PAID;

                $createdAt = now()->subDays($i * 7);
                $placedAt = $createdAt->copy()->addHours(1);

                $subtotal = $faker->randomFloat(2, 30000, 150000);
                $shippingFee = $faker->randomFloat(2, 0, 3000);
                $tax = $subtotal * 0.1;
                $total = $subtotal + $shippingFee + $tax;

                $orderNumber = 'P'.now()->format('Ymd').'-'.strtoupper(Str::random(6));

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'design_mode_code' => 'upload_file',
                    'status' => $status->value,
                    'payment_status' => $paymentStatus->value,
                    'currency' => 'KRW',
                    'subtotal_amount' => $subtotal,
                    'discount_amount' => 0,
                    'tax_amount' => $tax,
                    'shipping_fee' => $shippingFee,
                    'total_amount' => $total,
                    'estimated_production_days' => $faker->numberBetween(3, 5),
                    'requested_delivery_date' => $placedAt->copy()->addDays(5),
                    'placed_at' => $placedAt,
                    'contact_name' => $user->name,
                    'contact_phone' => $user->phone ?? '01012345678',
                    'contact_phone2' => '',
                    'contact_tel' => '',
                    'contact_email' => $user->email,
                    'company_name' => $faker->company(),
                    'shipping_name' => $user->name,
                    'shipping_phone' => $user->phone ?? '01012345678',
                    'shipping_postcode' => $faker->postcode(),
                    'shipping_address' => $faker->streetAddress(),
                    'shipping_address_detail' => $faker->secondaryAddress(),
                    'shipping_method' => ShippingMethod::COURIER,
                    'shipping_fee_type' => ShippingFeeType::PAYMENT,
                    'customer_note' => null,
                    'selected_options' => [],
                    'metadata' => [],
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'title' => '100매',
                    'quantity' => 100,
                    'multiplier' => 1,
                    'unit' => '매',
                    'production_days' => 3,
                    'unit_price' => $subtotal / 100,
                    'total_price' => $subtotal,
                    'configuration' => [
                        'unit_label' => '100매',
                    ],
                    'notes' => null,
                ]);
            }
        }

        $this->command->info('Created '.count($orders).' orders with various statuses and payment statuses for testing.');
    }
}
