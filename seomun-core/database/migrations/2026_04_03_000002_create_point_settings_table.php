<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_settings', function (Blueprint $table) {
            $table->id();
            $table->integer('signup_reward')->default(0)->comment('가입 시 적립 포인트 (Signup Reward Points)');
            $table->integer('monthly_reward_limit')->default(0)->comment('월간 적립 한도 (Monthly Reward Limit)');
            $table->integer('invite_reward_inviter')->default(0)->comment('초대자 적립 포인트 (Inviter Reward Points)');
            $table->integer('invite_reward_invited')->default(0)->comment('초대받은 자 적립 포인트 (Invited Reward Points)');
            $table->integer('min_order_amount_to_use')->default(0)->comment('포인트 사용 최소 주문 금액 (Min Order Amount to Use Points)');
            $table->integer('max_point_usage_percent')->default(0)->comment('최대 포인트 사용 비율 (%) (Max Point Usage Percent)');
            $table->integer('max_point_usage_amount')->default(0)->comment('최대 포인트 사용 금액 (Max Point Usage Amount)');
            $table->boolean('enable_payment_restriction')->default(true)->comment('');
            $table->boolean('enable_point_restriction')->default(true)->comment('');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_settings');
    }
};
