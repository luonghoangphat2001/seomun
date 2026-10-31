<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('address_books', function (Blueprint $table) {
            $table->string('email', 255)->nullable()->after('mobile')->comment('배송지 연락 이메일 (optional)');
        });
    }

    public function down(): void
    {
        Schema::table('address_books', function (Blueprint $table) {
            $table->dropColumn('email');
        });
    }
};
