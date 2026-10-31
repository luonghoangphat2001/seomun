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
        Schema::create('paper_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->constrained('papers')->cascadeOnDelete();
            $table->enum('paper_size_division_code', [
                'NATIONAL_FULL',
                'NATIONAL_2',
                'NATIONAL_4',
                'NATIONAL_8',
                'NATIONAL_16',
                'SIZE_46_FULL',
                'SIZE_46_2',
                'SIZE_46_4',
                'SIZE_46_8',
                'SIZE_46_16',
                'SMALL_NATIONAL_FULL',
                'SMALL_NATIONAL_2',
                'SMALL_NATIONAL_4',
                'SMALL_NATIONAL_8',
                'SMALL_NATIONAL_16'
            ]);
            $table->integer('supply_price');
            $table->integer('cost');
            $table->boolean('is_hot_deal')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['paper_id', 'paper_size_division_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paper_prices');
    }
};