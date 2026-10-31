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
        Schema::create('product_quantity_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity');
            $table->string('unit', 20)->default('sheets');
            $table->unsignedInteger('multiplier')->default(1);
            $table->decimal('price', 10, 2);
            $table->string('currency', 10)->default('KRW');
            $table->unsignedTinyInteger('production_days')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'quantity', 'multiplier', 'unit'], 'product_quantity_price_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_quantity_prices');
    }
};
