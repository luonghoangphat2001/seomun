<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('customers')->where('status', 'pending')->update(['status' => 'inactive']);
    }

    public function down(): void
    {
        //
    }
};
