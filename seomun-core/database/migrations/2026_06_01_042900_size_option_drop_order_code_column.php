<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('erp_size_options', function (Blueprint $table) {
            $table->dropColumn('order_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('erp_size_options', function (Blueprint $table) {
            $table->string('order_code')->nullable()->after('working_height');
        });
    }
};
