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
        Schema::table('product_option_groups', function (Blueprint $table) {
            $table->unsignedBigInteger('erp_option_group_id')->nullable()->after('product_id');

            $table->foreign('erp_option_group_id')
                ->references('id')
                ->on('erp_option_groups')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_option_groups', function (Blueprint $table) {
            $table->dropForeign(['erp_option_group_id']);
            $table->dropColumn('erp_option_group_id');
        });
    }
};
