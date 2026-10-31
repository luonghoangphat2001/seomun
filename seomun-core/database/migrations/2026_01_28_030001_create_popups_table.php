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
        Schema::create('popups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            // Either HTML content or image path (one of them required at application level)
            $table->text('content')->nullable();
            $table->string('image_path', 500)->nullable();
            $table->json('exposure_target')->nullable();
            $table->string('exposure_location', 50)->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('exposure_start_date')->nullable();
            $table->timestamp('exposure_end_date')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['exposure_location', 'is_active']);
            $table->index(['exposure_start_date', 'exposure_end_date']);
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('popups');
    }
};
