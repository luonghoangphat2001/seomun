<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['design_mode_id']);
            $table->dropColumn('design_mode_id');
            $table->string('design_mode_code')->after('product_name');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')
                ->nullable()
                ->after('order_id');
            $table->foreign('product_id')
                ->references('id')
                ->on('products')
                ->nullOnDelete();
            $table->dropForeign(['product_quantity_price_id']);
            $table->dropColumn('product_quantity_price_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('design_mode_id')->after('product_name');
            $table->dropColumn('design_mode_code');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->unsignedBigInteger('product_quantity_price_id')->after('order_id');
            $table->foreign('product_quantity_price_id')->references('id')->on('product_quantity_prices')->onDelete('cascade');
            $table->dropForeign(['product_id']);
            $table->dropColumn('product_id');
        });
    }
};
