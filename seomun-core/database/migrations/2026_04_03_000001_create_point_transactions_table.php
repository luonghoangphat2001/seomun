<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type')->comment('트랜잭션 유형 (Transaction Type)');
            $table->integer('amount')->comment('변동 금액 (Amount)');
            $table->integer('remaining_amount')->nullable()->comment('남은 금액 (Remaining Amount)');
            $table->integer('balance_after')->comment('변동 후 잔액 (Balance After)');
            $table->string('category')->comment('카테고리 (Category)');
            $table->foreignId('order_id')->nullable()->constrained();
            $table->string('reference_id')->nullable()->comment('참조 ID (Reference ID)');
            $table->unsignedBigInteger('parent_id')->nullable()->comment('부모 트랜잭션 ID (Parent Transaction ID)');
            $table->timestamp('expired_at')->nullable()->comment('만료 일시 (Expiration Date)');
            $table->text('description')->nullable()->comment('설명 (Description)');
            $table->foreignId('created_by')->nullable()->constrained('users')->comment('생성자 (Admin ID)');
            $table->timestamps();

            $table->index('user_id');
            $table->index('type');
            $table->index('category');
            $table->index('parent_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
    }
};
