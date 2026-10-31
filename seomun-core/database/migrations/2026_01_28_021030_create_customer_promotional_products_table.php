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
        Schema::create('customer_promotional_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade')->comment('Customer ID (고객사 ID)');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade')->comment('Product ID (제품 ID)');
            $table->integer('sort_order')->default(0)->comment('Sort order for promotional products (정렬 순서)');
            $table->timestamps();

            // Unique constraint: one customer can only have one record per product
            $table->unique(['customer_id', 'product_id']);

            // Indexes for faster queries
            $table->index('customer_id');
            $table->index('product_id');
            $table->index(['customer_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_promotional_products');
    }
};
