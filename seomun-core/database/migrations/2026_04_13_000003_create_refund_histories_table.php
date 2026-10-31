<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refund_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('settlement_date')->comment('정산일 (Settlement Date)');
            $table->unsignedBigInteger('refund_amount')->default(0)->comment('환불금액 (Refund Amount)');
            $table->string('account_holder')->comment('예금주 (Account Holder)');
            $table->string('bank_code')->comment('은행 (Bank Code)');
            $table->string('account_number')->comment('계좌번호 (Account Number)');
            $table->date('deposit_date')->nullable()->comment('입금일 (Deposit Date)');
            $table->string('status')->default('pending')->comment('처리상태: pending|completed|failed');
            $table->text('note')->nullable()->comment('비고 (Note)');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refund_histories');
    }
};
