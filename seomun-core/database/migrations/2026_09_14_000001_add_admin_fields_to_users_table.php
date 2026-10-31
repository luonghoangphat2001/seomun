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
        Schema::table('users', function (Blueprint $table) {
            $table->date('hire_date')->nullable()->after('position')->comment('입사일 (Hire date)');
            $table->date('resignation_date')->nullable()->after('hire_date')->comment('퇴사일 (Resignation date)');
            $table->string('department', 100)->nullable()->after('resignation_date')->comment('부서 (Department)');
            $table->string('bank_name', 100)->nullable()->after('department')->comment('은행명 (Bank name)');
            $table->string('account_number', 50)->nullable()->after('bank_name')->comment('계좌번호 (Account number)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'hire_date',
                'resignation_date',
                'department',
                'bank_name',
                'account_number',
            ]);
        });
    }
};
