<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MembershipTierSeeder extends Seeder
{
    public function run(): void
    {
        $tiers = [
            ['name' => 'Family', 'threshold_amount' => 0, 'accumulation_rate' => 0, 'has_free_shipping' => false, 'sort_order' => 1],
            ['name' => 'Bronze', 'threshold_amount' => 100000, 'accumulation_rate' => 0, 'has_free_shipping' => false, 'sort_order' => 2],
            ['name' => 'Silver', 'threshold_amount' => 500000, 'accumulation_rate' => 1, 'has_free_shipping' => false, 'sort_order' => 3],
            ['name' => 'Gold', 'threshold_amount' => 1000000, 'accumulation_rate' => 2, 'has_free_shipping' => false, 'sort_order' => 4],
            ['name' => 'Diamond', 'threshold_amount' => 3000000, 'accumulation_rate' => 3, 'has_free_shipping' => true, 'sort_order' => 5],
            ['name' => 'VIP', 'threshold_amount' => 12000000, 'accumulation_rate' => 4, 'has_free_shipping' => true, 'sort_order' => 6],
        ];

        foreach ($tiers as $tier) {
            DB::table('membership_tiers')->updateOrInsert(['name' => $tier['name']], $tier);
        }
    }
}
