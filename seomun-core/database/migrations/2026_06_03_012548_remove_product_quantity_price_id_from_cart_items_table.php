<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropForeign(['product_quantity_price_id']);
            $table->dropColumn('product_quantity_price_id');
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->unsignedBigInteger('product_quantity_price_id')->nullable();
            $table->foreign('product_quantity_price_id')->references('id')->on('product_quantity_prices')->nullOnDelete();
        });
    }
};
