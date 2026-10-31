<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('editor_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('editor_size_type_id');
            $table->string('name');
            $table->integer('width');
            $table->integer('height');
            $table->string('unit');
            $table->string('thumbnail_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('editor_size_type_id')->references('id')->on('editor_size_types')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('editor_sizes');
    }
};
