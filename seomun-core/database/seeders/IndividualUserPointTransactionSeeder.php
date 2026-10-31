<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Order;
use App\Services\PointTransactionService;
use App\Enums\PointTransactionType;
use App\Enums\PointCategory;
use Illuminate\Database\Seeder;

class IndividualUserPointTransactionSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('username', 'individual_user')->first();
        if (!$user) {
            $this->command->warn('User "individual_user" not found. Skipping.');
            return;
        }

        $service = app(PointTransactionService::class);

        // 1. Earn some points
        try {
            $service->earn(
                $user,
                PointTransactionType::EARN,
                PointCategory::MANUAL,
                200,
                'SEEDER_EARN_1',
                null,
                'Manual earn for seeding',
                null,
                null
            );
            $this->command->info('Earned 200 points for individual_user.');
        } catch (\Exception $e) {
            $this->command->error('Error earning points: ' . $e->getMessage());
        }

        // 2. Use points for an order if one exists
        $order = Order::where('user_id', $user->id)->latest()->first();
        if ($order) {
            try {
                $service->use(
                    $user,
                    100,
                    $order->total_amount,
                    $order
                );
                $this->command->info('Used 100 points for order ' . $order->order_number);
            } catch (\Exception $e) {
                $this->command->warn('Could not use points: ' . $e->getMessage());
            }
        } else {
            $this->command->info('No orders found for individual_user, skipping point usage.');
        }
    }
}
