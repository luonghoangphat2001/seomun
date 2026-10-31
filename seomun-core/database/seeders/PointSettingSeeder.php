<?php

namespace Database\Seeders;

use App\Models\PointSetting;
use Illuminate\Database\Seeder;

class PointSettingSeeder extends Seeder
{
    public function run(): void
    {
        PointSetting::firstOrCreate(
            [],
            [
                'signup_reward' => 100,
                'monthly_reward_limit' => 5000,
                'invite_reward_inviter' => 500,
                'invite_reward_invited' => 500,
                'min_order_amount_to_use' => 10000,
                'max_point_usage_percent' => 50,
                'max_point_usage_amount' => 50000,
                'enable_payment_restriction' => true,
                'enable_point_restriction' => true,
            ]
        );

        $this->command->info('PointSettingSeeder: default point settings seeded.');
    }
}
