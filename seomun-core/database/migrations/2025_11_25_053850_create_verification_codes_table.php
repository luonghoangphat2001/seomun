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
        Schema::create('verification_codes', function (Blueprint $table) {
            $table->id();
            $table->string('identifier', 255)->comment('이메일 또는 핸드폰 번호 (Email or Mobile Phone)');
            $table->enum('type', ['email', 'mobile'])->comment('인증 타입 (Verification Type)');
            $table->string('code', 10)->comment('인증번호 (Verification Code)');
            $table->enum('purpose', ['find_username', 'reset_password'])->default('find_username')->comment('용도 (Purpose)');
            $table->integer('attempts')->default(0)->comment('시도 횟수 (Attempt Count)');
            $table->integer('max_attempts')->default(5)->comment('최대 시도 횟수 (Max Attempts)');
            $table->timestamp('expires_at')->comment('만료 시간 (Expiration Time)');
            $table->timestamp('verified_at')->nullable()->comment('인증 완료 시간 (Verified At)');
            $table->timestamps();

            $table->index(['identifier', 'type', 'purpose']);
            $table->index('code');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_codes');
    }
};
