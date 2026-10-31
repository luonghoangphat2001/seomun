<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('saved_product_options', function (Blueprint $table) {
            $table->json('input_options')
                ->nullable()
                ->after('options')
                ->comment('Selected input design options (raw values) for the item: {text: string, count: number}');
        });
    }

    public function down(): void
    {
        Schema::table('saved_product_options', function (Blueprint $table) {
            $table->dropColumn('input_options');
        });
    }
};