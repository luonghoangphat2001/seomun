<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('outsourcing_companies', function (Blueprint $table) {
            $table->string('registration_number')->nullable()->after('representative_name')->comment('사업자등록번호');
            $table->string('registration_certificate')->nullable()->after('registration_number')->comment('사업자등록증 파일 경로');
        });
    }

    public function down(): void
    {
        Schema::table('outsourcing_companies', function (Blueprint $table) {
            $table->dropColumn(['registration_number', 'registration_certificate']);
        });
    }
};
