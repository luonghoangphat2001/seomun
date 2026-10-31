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
        Schema::table('templates', function (Blueprint $table) {
            $table->foreignId('size_option_id')
                ->nullable()
                ->constrained('erp_size_options')
                ->nullOnDelete()
                ->after('product_id')
                ->comment('Default size option for this template');

            $table->index('size_option_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropForeign(['size_option_id']);
            $table->dropColumn('size_option_id');
        });
    }
};
