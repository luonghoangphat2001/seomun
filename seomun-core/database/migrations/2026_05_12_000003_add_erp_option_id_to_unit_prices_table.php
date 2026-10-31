<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('unit_prices', function (Blueprint $table) {
            $table->unsignedBigInteger('erp_option_id')->nullable()->after('product_id');
            $table->index('erp_option_id');
        });
    }

    public function down(): void
    {
        Schema::table('unit_prices', function (Blueprint $table) {
            $table->dropIndex(['erp_option_id']);
            $table->dropColumn('erp_option_id');
        });
    }
};
