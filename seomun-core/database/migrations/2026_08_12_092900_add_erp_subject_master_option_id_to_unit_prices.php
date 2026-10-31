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
        Schema::table('unit_prices', function (Blueprint $table) {
            $table->unsignedBigInteger('erp_subject_master_option_id')->nullable()->after('product_id');
            $table->foreign('erp_subject_master_option_id')->references('id')->on('erp_options')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('unit_prices', function (Blueprint $table) {
            $table->dropForeign(['erp_subject_master_option_id']);
            $table->dropColumn('erp_subject_master_option_id');
        });
    }
};
