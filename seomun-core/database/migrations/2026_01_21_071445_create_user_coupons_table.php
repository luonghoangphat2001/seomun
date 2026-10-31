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
        Schema::create('user_coupons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->comment('사용자 ID (User ID)');
            $table->foreignId('coupon_id')->constrained()->onDelete('cascade')->comment('쿠폰 ID (Coupon ID)');
            $table->timestamp('received_at')->useCurrent()->comment('수령일 (Received Date)');
            $table->timestamp('used_at')->nullable()->comment('사용일 (Used Date)');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null')->comment('사용한 주문 ID (Order ID)');
            $table->enum('status', ['available', 'used', 'expired'])->default('available')->comment('상태 (Status)');
            $table->timestamps();

            // Unique constraint: one user can only have one instance of each coupon
            $table->unique(['user_id', 'coupon_id']);

            // Indexes for faster queries
            $table->index(['user_id', 'status']);
            $table->index(['coupon_id', 'status']);
            $table->index('received_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_coupons');
    }
};
