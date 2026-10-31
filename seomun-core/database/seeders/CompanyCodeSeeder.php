<?php

namespace Database\Seeders;

use App\Models\CompanyCode;
use Illuminate\Database\Seeder;

class CompanyCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companyCodes = [
            [
                'code' => 'COMP123',
                'company_name' => 'Test Company',
                'is_active' => true,
                'usage_count' => 0,
                'max_usage' => null, // Unlimited usage
                'expires_at' => null, // Never expires
            ],
            [
                'code' => 'DEMO2024',
                'company_name' => 'Demo Corporation',
                'is_active' => true,
                'usage_count' => 0,
                'max_usage' => 100,
                'expires_at' => now()->addYear(),
            ],
            [
                'code' => 'SEOMUN_CORE',
                'company_name' => 'Seomun Core Ltd.',
                'is_active' => true,
                'usage_count' => 0,
                'max_usage' => null,
                'expires_at' => null,
            ],
            [
                'code' => 'STAGING_001',
                'company_name' => 'Staging Test Company',
                'is_active' => true,
                'usage_count' => 0,
                'max_usage' => 50,
                'expires_at' => now()->addMonths(6),
            ],
        ];

        foreach ($companyCodes as $companyCode) {
            CompanyCode::updateOrCreate(
                ['code' => $companyCode['code']],
                $companyCode
            );
        }

        $this->command->info('Company codes seeded successfully!');
    }
}
