<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Models\DeliveryTracking;
use App\Models\Order;
use Illuminate\Database\Seeder;

class DeliveryTrackingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates delivery trackings for existing orders (one per order with unique invoice number).
     */
    public function run(): void
    {
        $orders = Order::whereDoesntHave('deliveryTracking')->get();

        if ($orders->isEmpty()) {
            $this->command->warn('No orders without delivery tracking found. Run OrderSeeder first or all orders already have delivery trackings.');

            return;
        }

        $couriers = ['Standard Delivery', 'Rapid Express', 'Premium Courier', 'Express Delivery Co', 'Quick Ship'];
        $statuses = [DeliveryStatus::Pickup, DeliveryStatus::InTransit, DeliveryStatus::Delivered];

        $count = 0;
        $year = now()->format('Y');
        foreach ($orders as $index => $order) {
            $invoiceNumber = 'INV-'.$year.str_pad((string) ($order->id + 1000), 4, '0', STR_PAD_LEFT);

            DeliveryTracking::create([
                'order_id' => $order->id,
                'invoice_number' => $invoiceNumber,
                'waybill_registered_at' => $order->created_at->addDays(rand(2, 10)),
                'delivery_status' => $statuses[$index % count($statuses)],
                'courier_name' => $couriers[$index % count($couriers)],
                'tracking_info' => [
                    'carrier' => $couriers[$index % count($couriers)],
                    'estimated_delivery' => $order->created_at->addDays(rand(5, 12))->format('Y-m-d'),
                    'location' => $index % 3 === 0 ? 'In transit - Distribution center' : null,
                ],
            ]);
            $count++;
        }

        $this->command->info("Created {$count} delivery trackings for existing orders.");
    }
}
