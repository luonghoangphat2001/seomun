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
        Schema::create('printing_prices', function (Blueprint $table) {
            $table->id();
            $table->enum('machine_type', ['IX3200', 'P1350', 'P140']);
            $table->enum('book_printing_size_type', ['TYPE_A', 'TYPE_B', 'TYPE_C', 'A4', 'A5', 'B5'])->nullable();
            $table->enum('side_type', ['SINGLE', 'DOUBLE'])->nullable();
            $table->string('name');
            $table->enum('book_printing_type', ['BOOKLET_COVER', 'BOOKLET_INNER'])->nullable();
            $table->boolean('is_hot_deal')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('printing_prices');
    }
};