<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductQuantityPrice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_quantity_price_id' => ProductQuantityPrice::factory(),
            'title' => '50매',
            'quantity' => $this->faker->randomNumber(2),
            'multiplier' => $this->faker->randomNumber(2),
            'unit' => '매',
            'production_days' => 3,
            'unit_price' => $this->faker->randomFloat(2, 50000, 150000),
            'total_price' => $this->faker->randomFloat(2, 50000, 150000),
            'configuration' => [
                'unit_label' => '50매',
            ],
            'notes' => null,
        ];
    }
}
