<?php

namespace Database\Seeders;

use App\Enums\ProductionCodeStatus;
use App\Models\Code;
use Illuminate\Database\Seeder;

class CodeSeeder extends Seeder
{
    /**
     * Minimal `codes` rows for Seomun (FSD web + Super Admin customer branch_in_charge).
     *
     * The previous Tara-era production-center catalog (dozens of MLA* internal codes) was
     * removed as out of scope for the public web-app FSD. Re-expand here if B2B needs it.
     */
    public function run(): void
    {
        $codes = [
            [
                'name' => 'POD Center (sample)',
                'code' => 'SM-POD-001',
                'properties' => [
                    'is_seomun_pod_shipping' => true,
                    'sales_status' => ProductionCodeStatus::OPEN,
                    'sort_order' => 10,
                ],
            ],
            [
                'name' => 'Office (sample)',
                'code' => 'SM-OFF-001',
                'properties' => [
                    'is_seomun_pod_shipping' => false,
                    'sales_status' => ProductionCodeStatus::OPEN,
                    'sort_order' => 20,
                ],
            ],
            [
                'name' => 'Branch 01',
                'code' => 'BR-01',
                'properties' => null,
            ],
            [
                'name' => 'Branch 02',
                'code' => 'BR-02',
                'properties' => null,
            ],
            [
                'name' => 'Branch 03',
                'code' => 'BR-03',
                'properties' => null,
            ],
            [
                'name' => 'Seoul Main Branch',
                'code' => 'SEOUL-001',
                'properties' => null,
            ],
            [
                'name' => 'Busan Branch',
                'code' => 'BUSAN-001',
                'properties' => null,
            ],
        ];

        foreach ($codes as $row) {
            Code::firstOrCreate(
                ['code' => $row['code']],
                $row
            );
        }

        $this->command->info('Codes seeded (minimal). Total: '.Code::count());
    }
}
