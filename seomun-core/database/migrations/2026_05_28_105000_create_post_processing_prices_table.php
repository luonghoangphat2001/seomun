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
        Schema::create('post_processing_prices', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->foreignId('erp_option_id')
                  ->constrained('erp_options')
                  ->onDelete('cascade');
            $table->enum('post_processing_size_type', ['NATIONAL_4', 'A3', 'A4', 'A5', 'A6'])->nullable();
            $table->json('attributes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_processing_prices');
    }
};