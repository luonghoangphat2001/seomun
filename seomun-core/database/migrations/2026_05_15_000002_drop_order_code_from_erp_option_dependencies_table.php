<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('erp_option_dependencies', function (Blueprint $table) {
            $table->dropColumn('order_code');
        });
    }

    public function down(): void
    {
        Schema::table('erp_option_dependencies', function (Blueprint $table) {
            $table->string('order_code')->nullable()
                ->comment('Target order code, or NULL for universal dependency');
        });
    }
};