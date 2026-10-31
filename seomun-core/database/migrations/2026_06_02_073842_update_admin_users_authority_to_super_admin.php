<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update admin users (no customer_id) with normal_user authority to super_admin
        DB::table('users')
            ->whereNull('customer_id')
            ->where('authority', 'normal_user')
            ->update(['authority' => 'super_admin']);
    }

    public function down(): void
    {
        //
    }
};
