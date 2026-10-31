<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('industry_type')->nullable()->after('business_items')->comment('업종');
            $table->string('tax_invoice_email')->nullable()->after('contact_email')->comment('전자세금계산서 이메일');
            $table->string('homepage_url')->nullable()->after('tax_invoice_email')->comment('홈페이지 URL');
            $table->string('business_registration_file')->nullable()->after('homepage_url')->comment('사업자등록증 파일 경로');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['industry_type', 'tax_invoice_email', 'homepage_url', 'business_registration_file']);
        });
    }
};
