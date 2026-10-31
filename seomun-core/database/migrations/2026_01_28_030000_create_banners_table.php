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
        Schema::create('banners', function (Blueprint $table) {
            // 1. Identification
            $table->id();
            $table->string('name', 255);

            // 2. Media Assets
            $table->string('image_path', 500);
            $table->string('image_path_mobile', 500)->nullable();
            $table->string('link_url', 500)->nullable();

            // 3. Target & Configuration
            // Exposure target: "all" or array of customer IDs
            $table->json('exposure_target')->nullable();
            $table->string('exposure_location', 50)->default('main');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);

            // 4. Scheduling
            $table->timestamp('exposure_start_date')->nullable();
            $table->timestamp('exposure_end_date')->nullable();

            // 5. Ownership & Timestamps
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // 6. Performance Optimization (Indexes)
            $table->index(['exposure_location', 'is_active']);
            $table->index(['exposure_start_date', 'exposure_end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
