<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('erp_size_options', function (Blueprint $table) {
            $table->dropForeign(['erp_option_id']);
            $table->dropColumn([
                'width',
                'height',
                'size_type',
                'is_custom_input_allowed',
                'min_width',
                'max_width',
                'min_height',
                'max_height',
                'width_step',
                'height_step',
                'additional_widths',
                'additional_heights',
                'size_limit',
                'erp_option_id',
                'is_default',
                'size_ratio',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('erp_size_options', function (Blueprint $table) {
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();

            $table->string('size_type')->nullable();

            $table->boolean('is_custom_input_allowed')
                ->default(false);

            $table->integer('min_width')->nullable();
            $table->integer('max_width')->nullable();

            $table->integer('min_height')->nullable();
            $table->integer('max_height')->nullable();

            $table->integer('width_step')->default(1);
            $table->integer('height_step')->default(1);

            $table->json('additional_widths')->nullable();
            $table->json('additional_heights')->nullable();

            $table->integer('size_limit')->nullable();

            $table->boolean('is_default')->default(false);

            $table->integer('size_ratio')->default(100);
            $table->foreignId('erp_option_id')
                ->nullable()
                ->constrained('erp_options')
                ->nullOnDelete();
        });
    }
};
