<?php

namespace Database\Seeders;

use App\Models\BundleTier;
use Illuminate\Database\Seeder;

class BundleTierSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['bundle_value' => 1.00, 'label' => '1건', 'sort_order' => 100],
            ['bundle_value' => 1.50, 'label' => '1.5건', 'sort_order' => 150],
            ['bundle_value' => 2.00, 'label' => '2건', 'sort_order' => 200],
            ['bundle_value' => 3.00, 'label' => '3건', 'sort_order' => 300],
            ['bundle_value' => 5.00, 'label' => '5건', 'sort_order' => 500],
        ] as $row) {
            BundleTier::updateOrCreate(
                ['bundle_value' => $row['bundle_value']],
                [
                    'label' => $row['label'],
                    'sort_order' => $row['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
