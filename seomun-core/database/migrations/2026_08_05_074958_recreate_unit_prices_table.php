<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('unit_price_change_logs');
        Schema::dropIfExists('unit_price_items');
        Schema::dropIfExists('unit_prices');

        Schema::create('unit_prices', function (Blueprint $table) {
            $table->id();

            $table->foreignId('erp_size_option_id')
                ->nullable()
                ->constrained('erp_options')
                ->nullOnDelete();

            $table->foreignId('erp_paper_option_id')
                ->nullable()
                ->constrained('erp_options')
                ->nullOnDelete();

            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('product_type')->nullable(); // Add this
            $table->json('combination_options')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index('product_type');
            $table->index('is_active');
            $table->index(['erp_size_option_id', 'erp_paper_option_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_prices');
    }
};