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
        // 1. Create cart_items with the correct column types from the start
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');

            $table->foreignId('product_quantity_price_id')
                ->nullable()
                ->constrained('product_quantity_prices')
                ->nullOnDelete();

            $table->unsignedBigInteger('design_id')->nullable();
            $table->json('design_ids')
                ->nullable()
                ->comment('OrderArtwork ids grouped by side: {front: int, back: int}');

            $table->foreignId('bulk_order_batch_id')
                ->nullable()
                ->constrained('bulk_order_batches')
                ->nullOnDelete();

            $table->integer('quantity')->default(1);

            // Defined as decimal(8,2) immediately
            $table->decimal('number_of_cases', 8, 2)->default(1)->comment('Number of sets/cases');

            $table->decimal('price', 15, 2)->nullable()->comment('Snapshot price at time of adding');
            $table->json('options')->nullable()->comment('Product options/configuration');

            $table->text('notes')->nullable();
            $table->timestamp('storage_date')
                ->nullable()
                ->comment('Cart item preview/storage expiration date');
            $table->json('input_options')
                ->nullable()
                ->comment('Selected input design options (raw values) for the item: {text: string, count: number}');

            $table->timestamps();

            // Indexes
            $table->index('cart_id');
            $table->index('product_id');
            $table->index('design_id');
            $table->index('bulk_order_batch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
