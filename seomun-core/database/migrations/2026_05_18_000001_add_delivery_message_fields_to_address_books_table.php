<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('address_books', function (Blueprint $table) {
            $table->string('delivery_message_preset')->nullable()->after('delivery_message')->comment('배송 메시지 프리셋 (Delivery Message Preset)');
            $table->string('delivery_message_custom')->nullable()->after('delivery_message_preset')->comment('직접 입력 배송 메시지 (Custom Delivery Message)');
        });
    }

    public function down(): void
    {
        Schema::table('address_books', function (Blueprint $table) {
            $table->dropColumn(['delivery_message_preset', 'delivery_message_custom']);
        });
    }
};
