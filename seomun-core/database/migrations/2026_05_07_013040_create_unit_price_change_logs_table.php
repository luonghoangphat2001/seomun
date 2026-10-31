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
        Schema::create('unit_price_change_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_price_item_id')->constrained()->cascadeOnDelete();
            $table->string('unit_price_item_name');
            $table->decimal('price_before', 15, 2);
            $table->decimal('price_after', 15, 2);
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['unit_price_item_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_price_change_logs');
    }
};
