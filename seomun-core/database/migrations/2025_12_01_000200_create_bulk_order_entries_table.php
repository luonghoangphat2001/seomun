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
        Schema::create('bulk_order_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')
                ->constrained('bulk_order_batches')
                ->cascadeOnDelete();
            $table->unsignedInteger('row_number')->comment('Row number in the uploaded excel (1-based)');
            $table->json('data')->nullable()->comment('Parsed row data (name, phone, position, etc.)');
            $table->string('status', 50)->default('pending')->comment('pending, valid, invalid, ordered');
            $table->text('error_message')->nullable();
            $table->foreignId('order_artwork_id')
                ->nullable()
                ->constrained('order_artworks')
                ->nullOnDelete();
            $table->timestamps();

            $table->index(['batch_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bulk_order_entries');
    }
};
