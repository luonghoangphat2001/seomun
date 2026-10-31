<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('upload_art_works', function (Blueprint $table) {
            $table->id();

            $table->foreignId('design_group_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('url');
            $table->string('name')->nullable();
            $table->string('size')->nullable();
            $table->string('mime')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('print_as_is')->default(false);
            $table->boolean('print_without_proof')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('upload_art_works');
    }
};