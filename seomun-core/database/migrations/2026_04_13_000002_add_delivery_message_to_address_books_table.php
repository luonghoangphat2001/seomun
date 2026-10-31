<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('address_books', function (Blueprint $table) {
            $table->string('delivery_message')->nullable()->after('is_default')->comment('배송 메시지 (Delivery Message)');
        });
    }

    public function down(): void
    {
        Schema::table('address_books', function (Blueprint $table) {
            $table->dropColumn('delivery_message');
        });
    }
};
