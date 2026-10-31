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
        DB::statement("ALTER TABLE user_coupons MODIFY COLUMN status ENUM('available', 'used', 'expired', 'upcoming') NOT NULL DEFAULT 'available' COMMENT '상태 (Status)'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE user_coupons MODIFY COLUMN status ENUM('available', 'used', 'expired') NOT NULL DEFAULT 'available' COMMENT '상태 (Status)'");
    }
};
