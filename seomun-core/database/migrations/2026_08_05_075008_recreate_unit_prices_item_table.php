<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
     public function up(): void
    {
        Schema::create('unit_price_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('unit_price_id');
            $table->decimal('raw_cost', 12, 2);
            $table->decimal('price_value', 12, 2);
            $table->json('attributes')->nullable();
            $table->integer('quantity_min')->default(1);
            $table->boolean('is_active')->default(true);

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            $table->foreign('unit_price_id')->references('id')->on('unit_prices')->onDelete('cascade');
            $table->index('unit_price_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_price_items');
    }
};
