<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $mapping = [
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

        foreach ($mapping as $old => $new) {
            DB::table('faqs')
                ->where('category', $old)
                ->update(['category' => $new]);
        }
    }

    public function down(): void
    {
        // The legacy categories had overlapping meanings, so this migration is intentionally irreversible.
    }
};
