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
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('쿠폰 코드 (Coupon Code)');
            $table->string('name', 200)->comment('쿠폰명 (Coupon Name)');
            $table->text('description')->nullable()->comment('쿠폰 설명 (Description)');
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage')->comment('할인 유형 (Discount Type)');
            $table->decimal('discount_value', 10, 2)->comment('할인 값 (Discount Value)');
            $table->decimal('min_order_amount', 10, 2)->default(0)->comment('최소 주문 금액 (Minimum Order Amount)');
            $table->decimal('max_discount_amount', 10, 2)->nullable()->comment('최대 할인 금액 (Max Discount Amount)');
            $table->integer('usage_limit')->nullable()->comment('사용 제한 횟수 (Usage Limit - null = unlimited)');
            $table->integer('usage_count')->default(0)->comment('사용 횟수 (Usage Count)');
            $table->timestamp('starts_at')->nullable()->comment('시작일 (Start Date)');
            $table->timestamp('expires_at')->nullable()->comment('만료일 (Expiration Date)');
            $table->boolean('is_active')->default(true)->comment('활성화 여부 (Active Status)');
            $table->integer('sort_order')->default(0)->comment('정렬 순서 (Sort Order)');
            $table->timestamps();
            $table->softDeletes();

            $table->index('code');
            $table->index(['is_active', 'expires_at']);
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
