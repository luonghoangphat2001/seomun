<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->comment('직원 (admin user)');
            $table->date('attendance_date')->comment('날짜');
            $table->time('check_in')->nullable()->comment('출근 시간');
            $table->time('check_out')->nullable()->comment('퇴근 시간');
            $table->string('status')->default('present')->comment('상태 (present/absent/late/half_day/vacation)');
            $table->text('notes')->nullable()->comment('비고');
            $table->timestamps();

            $table->unique(['user_id', 'attendance_date']);
            $table->index('attendance_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
