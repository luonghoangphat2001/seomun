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
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete()->after('erp_option_id');
            $table->string('combination_key')->nullable()->after('unit_price_key');
            $table->json('combination_options')->nullable()->after('combination_key');
            $table->dropColumn(['unit_price_key']);
        });
    }

    public function down(): void
    {
        Schema::table('unit_prices', function (Blueprint $table) {
            $table->dropColumn(['combination_options', 'combination_key']);
            $table->dropForeign(['product_id']);
            $table->dropColumn(['product_id']);
            $table->string('unit_price_key')->nullable();
        });
    }
};
