<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('product_web_editor');

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('web_editor_id')
                ->nullable()
                ->constrained('web_editors')
                ->nullOnDelete();
            $table->index('web_editor_id');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['web_editor_id']);
            $table->dropColumn('web_editor_id');
        });

        Schema::create('product_web_editor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('web_editor_id')->constrained('web_editors')->cascadeOnDelete();
            $table->timestamps();
        });
    }
};