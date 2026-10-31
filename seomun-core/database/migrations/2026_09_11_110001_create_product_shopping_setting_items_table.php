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
        Schema::create('product_shopping_setting_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('shopping_setting_id')->constrained('shopping_settings')->cascadeOnDelete();
            $table->foreignId('shopping_setting_item_id')->constrained('shopping_setting_items')->cascadeOnDelete();
            $table->timestamps();

            // Ensure that only one item can be selected per Shopping Setting Type for each product.
            $table->unique(['product_id', 'shopping_setting_id'], 'prod_shop_setting_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_shopping_setting_items');
    }
};
