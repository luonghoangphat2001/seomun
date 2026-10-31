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
        Schema::create('company_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('인증코드 (Authentication Code)');
            $table->string('company_name', 100)->nullable()->comment('회사명 (Company Name)');
            $table->boolean('is_active')->default(true)->comment('활성화 여부 (Active Status)');
            $table->integer('usage_count')->default(0)->comment('사용 횟수 (Usage Count)');
            $table->integer('max_usage')->nullable()->comment('최대 사용 횟수 (Max Usage Limit)');
            $table->timestamp('expires_at')->nullable()->comment('만료일 (Expiration Date)');
            $table->timestamps();
            $table->softDeletes();

            $table->index('code');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_codes');
    }
};
