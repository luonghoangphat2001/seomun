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
        Schema::create('order_extra_entries', function (Blueprint $table) {
            $table->id();

            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('is_required')->default(false);

            $table->string('label', 100); // 라벨명
            $table->enum('input_type', ['text', 'select', 'number', 'date']);
            $table->text('input_options')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_extra_entries');
    }
};
