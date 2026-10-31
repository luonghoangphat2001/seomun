<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('editor_size_template', function (Blueprint $table) {
            $table->id();
            $table->foreignId('editor_size_id')->constrained()->onDelete('cascade');
            $table->foreignId('template_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['editor_size_id', 'template_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('editor_size_template');
    }
};
