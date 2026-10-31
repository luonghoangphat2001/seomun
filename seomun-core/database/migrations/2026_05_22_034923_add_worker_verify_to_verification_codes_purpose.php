<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE verification_codes MODIFY COLUMN purpose ENUM('find_username','reset_password','register','find_id','change_phone','worker_verify') NOT NULL DEFAULT 'find_username'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE verification_codes MODIFY COLUMN purpose ENUM('find_username','reset_password','register','find_id','change_phone') NOT NULL DEFAULT 'find_username'");
    }
};
