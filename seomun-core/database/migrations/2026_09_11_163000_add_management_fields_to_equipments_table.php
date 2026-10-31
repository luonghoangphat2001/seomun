<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('equipments', function (Blueprint $table) {
            $table->string('company_name')->nullable()->change();
            $table->string('manufacturer')->nullable()->after('name')->comment('제조사');
            $table->string('maintenance_company')->nullable()->after('manufacturer')->comment('관리사');
            $table->string('manager_name')->nullable()->after('maintenance_company')->comment('담당자');
            $table->string('manager_phone')->nullable()->after('manager_name')->comment('담당자 연락처');
            $table->date('introduced_at')->nullable()->after('manager_phone')->comment('도입 시기');
        });
    }

    public function down(): void
    {
        Schema::table('equipments', function (Blueprint $table) {
            $table->dropColumn([
                'manufacturer',
                'maintenance_company',
                'manager_name',
                'manager_phone',
                'introduced_at',
            ]);
            $table->string('company_name')->nullable(false)->change();
        });
    }
};
