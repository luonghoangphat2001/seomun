<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Merge in_progress + completed → responded, delivery → shipping
        DB::table('inquiries')
            ->whereIn('status', ['in_progress', 'completed'])
            ->update(['status' => 'responded']);

        DB::table('inquiries')
            ->where('category', 'delivery')
            ->update(['category' => 'shipping']);
    }

    public function down(): void
    {
        // No reliable rollback for data migration
    }
};
