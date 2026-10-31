<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('web_editors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type', 50);
            $table->decimal('width', 10, 2);
            $table->decimal('height', 10, 2);
            $table->string('unit', 10)->default('mm');
            $table->unsignedInteger('dpi')->nullable();
            $table->decimal('bleed', 8, 2)->nullable();
            $table->decimal('safe_area', 8, 2)->nullable();
            $table->json('config_json')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['type', 'is_active']);
            $table->index('is_active');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('web_editors');
    }
};