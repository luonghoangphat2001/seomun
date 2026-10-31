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
        Schema::create('product_specifications', function (Blueprint $table) {
            $table->id();

            // Relationship: Link to products table (One-to-One)
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();

            // Dimension: Bleed size (Extra area to prevent white edges after cutting)
            $table->decimal('bleed_width', 10, 2)->nullable();
            $table->decimal('bleed_height', 10, 2)->nullable();

            // Dimension: Safe area (Inside area where text/logos should be placed)
            $table->decimal('safe_width', 10, 2)->nullable();
            $table->decimal('safe_height', 10, 2)->nullable();

            // Dimension: General display size and unit
            $table->decimal('size_width_mm', 10, 2)->nullable();
            $table->decimal('size_height_mm', 10, 2)->nullable();
            $table->string('size_unit', 10)->default('mm');

            // Material details: Paper type and density (gsm)
            $table->string('paper_type', 100)->nullable();
            $table->unsignedSmallInteger('paper_weight_gsm')->nullable();

            // Logistics: Estimated production time and additional info
            $table->unsignedSmallInteger('production_time_days')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_specifications');
    }
};
