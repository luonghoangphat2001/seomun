<?php

namespace Database\Seeders;

use App\Enums\ShippingFeeType;
use App\Enums\ShippingMethod;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class SampleOrderSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('authority', 'super_admin')->first() ?? User::first();

        if (! $user) {
            $this->command->warn('No users found. Run AdminUserSeeder first.');
            return;
        }

        $product = Product::first();

        $orders = [
            [
                'order_number'   => 'ORD-SAMPLE-001',
                'product_name'   => $product?->name ?? '명함 (고급)',
                'status'         => 'confirmed',
                'contact_name'   => '김철수',
                'contact_phone'  => '010-1111-2222',
                'shipping_address' => '서울시 강남구 테헤란로 123',
                'customer_note'  => '빠른 배송 부탁드립니다',
                'subtotal'       => 50000,
                'items'          => [
                    ['title' => '명함 500매', 'quantity' => 500, 'unit_price' => 80, 'production_days' => 3],
                    ['title' => '봉투 100매', 'quantity' => 100, 'unit_price' => 100, 'production_days' => 2],
                ],
            ],
            [
                'order_number'   => 'ORD-SAMPLE-002',
                'product_name'   => $product?->name ?? '전단지 (A4)',
                'status'         => 'in_production',
                'contact_name'   => '이영희',
                'contact_phone'  => '010-3333-4444',
                'shipping_address' => '경기도 수원시 팔달구 인계로 56',
                'customer_note'  => null,
                'subtotal'       => 120000,
                'items'          => [
                    ['title' => '전단지 1000매', 'quantity' => 1000, 'unit_price' => 100, 'production_days' => 5],
                ],
            ],
            [
                'order_number'   => 'ORD-SAMPLE-003',
                'product_name'   => $product?->name ?? '브로셔 (A5)',
                'status'         => 'pending',
                'contact_name'   => '박민준',
                'contact_phone'  => '010-5555-6666',
                'shipping_address' => '부산시 해운대구 센텀중앙로 79',
                'customer_note'  => '접지 포함해주세요',
                'subtotal'       => 200000,
                'items'          => [
                    ['title' => '브로셔 200매', 'quantity' => 200, 'unit_price' => 600, 'production_days' => 7],
                    ['title' => 'UV 코팅', 'quantity' => 200, 'unit_price' => 400, 'production_days' => 2],
                ],
            ],
        ];

        foreach ($orders as $data) {
            $order = Order::firstOrCreate(
                ['order_number' => $data['order_number']],
                [
                    'user_id'          => $user->id,
                    'product_id'       => $product?->id,
                    'product_name'     => $data['product_name'],
                    'status'           => $data['status'],
                    'payment_status'   => 'paid',
                    'currency'         => 'KRW',
                    'subtotal_amount'  => $data['subtotal'],
                    'discount_amount'  => 0,
                    'tax_amount'       => $data['subtotal'] * 0.1,
                    'shipping_fee'     => 3000,
                    'total_amount'     => $data['subtotal'] * 1.1 + 3000,
                    'contact_name'     => $data['contact_name'],
                    'contact_phone'    => $data['contact_phone'],
                    'contact_phone2'   => '',
                    'shipping_name'    => $data['contact_name'],
                    'shipping_phone'   => $data['contact_phone'],
                    'shipping_address' => $data['shipping_address'],
                    'shipping_method'   => ShippingMethod::COURIER,
                    'shipping_fee_type' => ShippingFeeType::PAYMENT,
                    'customer_note'    => $data['customer_note'],
                    'placed_at'        => now(),
                ]
            );

            if ($order->wasRecentlyCreated) {
                foreach ($data['items'] as $item) {
                    OrderItem::create([
                        'order_id'    => $order->id,
                        'title'       => $item['title'],
                        'quantity'    => $item['quantity'],
                        'multiplier'  => 1,
                        'unit'        => '매',
                        'unit_price'  => $item['unit_price'],
                        'total_price' => $item['quantity'] * $item['unit_price'],
                        'production_days' => $item['production_days'],
                    ]);
                }
            }

            $this->command->info("Order {$data['order_number']} ready (id={$order->id})");
        }
    }
}
