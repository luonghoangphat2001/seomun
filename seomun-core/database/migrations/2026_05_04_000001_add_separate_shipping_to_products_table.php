<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('requires_separate_shipping')->default(false)->after('client_name')
                ->comment('따로 보내야 하는 품목 (e.g. standee, signboard) — charged separately per item');
            $table->decimal('separate_shipping_fee', 10, 2)->default(0)->after('requires_separate_shipping')
                ->comment('Extra shipping fee per item when requires_separate_shipping = true');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['requires_separate_shipping', 'separate_shipping_fee']);
        });
    }
};
