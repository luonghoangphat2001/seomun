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
        Schema::create('limit_usaged_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_limit_id')->nullable();
            $table->foreign('user_limit_id')->references('id')->on('user_limits')->nullOnDelete();
            $table->string('reference_id');
            $table->string('reference_type')->nullable();
            $table->decimal('usage_amount', 10, 2);
            $table->decimal('remaining_amount', 10, 2);
            $table->string('description')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index('user_limit_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('limit_usaged_logs');
    }
};
