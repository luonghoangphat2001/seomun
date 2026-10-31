<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_erp_option', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete()->comment('Product ID');
            $table->foreignId('erp_option_id')->constrained('erp_options')->cascadeOnDelete()->comment('ERP Option ID');
            $table->timestamps();

            $table->unique(['product_id', 'erp_option_id'], 'product_erp_option_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_erp_option');
    }
};
