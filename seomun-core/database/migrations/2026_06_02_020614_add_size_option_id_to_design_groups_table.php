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
        Schema::table('design_groups', function (Blueprint $table) {
            $table->foreignId('size_option_id')
                ->nullable()
                ->constrained('erp_size_options')
                ->nullOnDelete();
            $table->dropColumn('size');
            $table->integer('width_mm')->nullable();
            $table->integer('height_mm')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('design_groups', function (Blueprint $table) {
            $table->string('size')->after('title');
            $table->dropForeign(['size_option_id']);
            $table->dropColumn('size_option_id');
            $table->dropColumn(['width_mm', 'height_mm']);
        });
    }
};
