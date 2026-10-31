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
            $table->integer('additional_shipping_fee')->default(0)->after('shipping_fee')->comment('Shipping fee entered by Admin');
            $table->string('shipping_adjustment_reason', 500)->nullable()->after('additional_shipping_fee')->comment('Reason for adjusting the shipping fee');
            $table->foreignId('shipping_adjusted_by')->nullable()->after('shipping_adjustment_reason')->constrained('users')->nullOnDelete();
            $table->timestamp('shipping_adjusted_at')->nullable()->after('shipping_adjusted_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['shipping_adjusted_by']);
            $table->dropColumn([
                'additional_shipping_fee',
                'shipping_adjustment_reason',
                'shipping_adjusted_by',
                'shipping_adjusted_at',
            ]);
        });
    }
};
