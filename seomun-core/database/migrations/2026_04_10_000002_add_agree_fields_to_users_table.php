<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('agree_sms')->default(false)->after('agree_terms')->comment('SMS 수신동의 (필수)');
            $table->boolean('agree_email')->default(false)->after('agree_sms')->comment('이메일 수신동의 (선택)');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['agree_sms', 'agree_email']);
        });
    }
};
