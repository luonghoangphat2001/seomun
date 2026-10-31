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
        Schema::create('post_processing_price_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_processing_price_id')->constrained('post_processing_prices')->cascadeOnDelete();
            $table->integer('quantity');
            $table->integer('supply_price');
            $table->integer('cost');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_processing_price_items');
    }
};