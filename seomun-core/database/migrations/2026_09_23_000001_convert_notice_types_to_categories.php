<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('notices')->whereIn('type', ['general', 'important'])->update(['type' => 'other']);
        DB::table('notices')->where('type', 'maintenance')->update(['type' => 'service']);
    }

    public function down(): void
    {
        // The old categories cannot be restored without knowing the original business category.
    }
};
