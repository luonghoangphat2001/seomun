<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('direct_shipping_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('shipping_name')->comment('배송지명');
            $table->string('recipient_name')->comment('이름');
            $table->string('phone')->nullable()->comment('전화번호');
            $table->string('postcode')->nullable()->comment('우편번호');
            $table->string('address')->nullable()->comment('주소');
            $table->string('detailed_address')->nullable()->comment('상세 주소');
            $table->string('storage_location')->nullable()->comment('보관장소');
            $table->string('file_path')->nullable()->comment('업로드 파일 경로');
            $table->string('file_name')->nullable()->comment('업로드 파일 원본명');
            $table->text('detail_request')->comment('상세요청');
            $table->unsignedBigInteger('amount')->default(0)->comment('입금액 (VAT 포함)');
            $table->string('status')->default('pending')->comment('pending|confirmed|completed|cancelled');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('direct_shipping_requests');
    }
};
