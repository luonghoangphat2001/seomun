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
        Schema::table('orders', function (Blueprint $table) {
            // Add shipping message preset (short preset text)
            $table->string('shipping_message_preset', 255)->nullable()->after('shipping_time');
            // Add shipping message custom (longer custom message)
            $table->text('shipping_message_custom')->nullable()->after('shipping_message_preset');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_message_preset', 'shipping_message_custom']);
        });
    }
};