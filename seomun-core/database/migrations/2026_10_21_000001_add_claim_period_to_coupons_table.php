<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the period during which a customer may receive a coupon.
     *
     * starts_at / expires_at deliberately remain the coupon's usage period.
     */
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->timestamp('claim_starts_at')->nullable()->comment('쿠폰 수령 시작일 (Claim Start Date)');
            $table->timestamp('claim_ends_at')->nullable()->comment('쿠폰 수령 종료일 (Claim End Date)');
            $table->index(['is_active', 'claim_starts_at', 'claim_ends_at'], 'coupons_claim_period_index');
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropIndex('coupons_claim_period_index');
            $table->dropColumn(['claim_starts_at', 'claim_ends_at']);
        });
    }
};
