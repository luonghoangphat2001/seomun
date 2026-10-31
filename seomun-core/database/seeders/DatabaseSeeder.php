<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // FSD-oriented default seed: catalog + pricing tiers + light payment samples.
        // Optional: CodeSeeder (minimal branch/POD codes for Super Admin customer tests), UserSeeder, PartnerSeeder, etc.
        $this->call([
            // caution: CategorySeeder will truncate the categories table. Only run on local/dev.
            CategorySeeder::class,
            ProductSeeder::class,
            BundleTierSeeder::class,
            ProductQuantityPricesTierSeeder::class,
            // OrderSeeder::class,
            // CompanyCodeSeeder::class,
            // UserSeeder::class,
            // PaymentTransactionSeeder::class,
            // UserGuideProductSeeder::class, // 이용안내 – link user guides to existing products
            // AccessLogSeeder::class, // Sample data for admin Access Log screen
            // OrganizationUnitSeeder::class, // Run after PartnerSeeder + UserSeeder for org chart testing
            // RefundAccountSeeder::class, // Run after UserSeeder for refund account + history samples
            // DirectShippingRequestSeeder::class, // Sample direct shipping requests for testing
            // SampleUserSeeder::class, // 1 individual + 1 business user for testing
        ]);
    }
}
