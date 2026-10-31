<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Rename normal → active, deactive/pending → inactive
        DB::table('customers')->where('status', 'normal')->update(['status' => 'active']);
        DB::table('customers')->whereIn('status', ['deactive', 'pending'])->update(['status' => 'inactive']);
    }

    public function down(): void
    {
        DB::table('customers')->where('status', 'active')->update(['status' => 'normal']);
        DB::table('customers')->where('status', 'inactive')->update(['status' => 'deactive']);
    }
};
