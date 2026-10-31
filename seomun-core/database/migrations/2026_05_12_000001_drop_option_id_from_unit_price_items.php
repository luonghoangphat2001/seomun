<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('unit_price_items', function (Blueprint $table) {
            $table->dropUnique(['unit_price_id', 'option_id']);
            $table->dropIndex(['option_id']);
            $table->dropColumn('option_id');
        });
    }

    public function down(): void
    {
        Schema::table('unit_price_items', function (Blueprint $table) {
            $table->unsignedBigInteger('option_id')->nullable();
            $table->index('option_id');
            $table->unique(['unit_price_id', 'option_id']);
        });
    }
};