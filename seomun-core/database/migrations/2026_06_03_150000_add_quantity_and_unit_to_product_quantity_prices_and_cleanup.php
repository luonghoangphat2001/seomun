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
        Schema::table('product_quantity_prices', function (Blueprint $table) {
            // Add new fields
            $table->unsignedInteger('quantity')->nullable()->after('production_days');
            $table->string('unit', 20)->nullable()->after('quantity');

            // Remove deprecated fields
            $table->dropForeign(['quantity_price_tier_id']);
            $table->dropForeign(['bundle_tier_id']);
            $table->dropUnique('product_quantity_prices_product_tier_bundle_unique');
            $table->dropColumn(['quantity_price_tier_id', 'bundle_tier_id', 'is_default']);
        });

        // Re‑create the unique constraint involving the newly added columns
        Schema::table('product_quantity_prices', function (Blueprint $table) {
            $table->unique(['product_id', 'quantity'], 'product_quantity_price_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_quantity_prices', function (Blueprint $table) {
            // Re‑add the deprecated columns
            $table->foreignId('quantity_price_tier_id')->nullable()->after('product_id');
            $table->foreignId('bundle_tier_id')->nullable()->after('quantity_price_tier_id');
            $table->boolean('is_default')->default(false)->after('bundle_tier_id');
            $table->dropColumn(['quantity', 'unit']);
        });

        Schema::table('product_quantity_prices', function (Blueprint $table) {
            // Restore the unique constraint that existed before
            $table->unique(['product_id', 'quantity_price_tier_id', 'bundle_tier_id', 'is_default'], 'product_quantity_price_unique');
        });
    }
};