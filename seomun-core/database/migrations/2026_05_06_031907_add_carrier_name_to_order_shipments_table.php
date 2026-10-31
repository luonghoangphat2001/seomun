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
        Schema::table('order_shipments', function (Blueprint $table) {
            $table->string('carrier_name')->nullable()->after('carrier_code');
            $table->string('shipping_method')->nullable()->after('carrier_name');
            $table->text('memo')->nullable()->after('shipping_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_shipments', function (Blueprint $table) {
            $table->dropColumn(['carrier_name', 'shipping_method', 'memo']);
        });
    }
};
