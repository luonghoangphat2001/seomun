<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * One-time migration: remap old FAQ categories → new ones.
 *
 * Old → New mapping:
 *   member, customer_service → membership
 *   order                   → orders
 *   payment, accounting     → payment_accounting
 *   delivery                → shipping_delivery
 *   file_submission         → files
 *   other, as               → design
 */
class FaqCategoryMigrationSeeder extends Seeder
{
    private const MAPPING = [
        'member' => 'membership',
        'customer_service' => 'membership',
        'order' => 'orders',
        'payment' => 'payment_accounting',
        'accounting' => 'payment_accounting',
        'delivery' => 'shipping_delivery',
        'file_submission' => 'files',
        'other' => 'design',
        'as' => 'design',
    ];

    public function run(): void
    {
        foreach (self::MAPPING as $old => $new) {
            $count = DB::table('faqs')
                ->where('category', $old)
                ->update(['category' => $new]);

            $this->command->info("  {$old} → {$new}: {$count} rows updated");
        }

        $this->command->info('FAQ category migration complete.');
    }
}
