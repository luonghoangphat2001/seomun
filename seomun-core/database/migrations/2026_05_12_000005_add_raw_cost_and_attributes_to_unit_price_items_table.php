<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('unit_price_items', function (Blueprint $table) {
            $table->decimal('raw_cost', 12, 2)->nullable()->after('price_value');
            $table->json('attributes')->nullable()->after('raw_cost');
            $table->integer('quantity_min')->nullable()->after('attributes');
        });
    }

    public function down(): void
    {
        Schema::table('unit_price_items', function (Blueprint $table) {
            $table->dropColumn(['raw_cost', 'attributes', 'quantity_min']);
        });
    }
};
