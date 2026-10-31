<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipments', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->comment('업체명');
            $table->string('name')->comment('장비명');
            $table->string('image')->nullable()->comment('이미지 경로');
            $table->string('work_process')->comment('작업공정 (coating/cutting/output/printing)');
            $table->string('work_type')->nullable()->comment('작업유형');
            $table->string('status')->default('active')->comment('상태 (active/inactive/maintenance)');
            $table->text('notes')->nullable()->comment('비고');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('equipment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipments')->onDelete('cascade');
            $table->date('log_date')->comment('날짜');
            $table->text('maintenance_details')->comment('정비 내용');
            $table->text('special_notes')->nullable()->comment('특이사항');
            $table->string('cost_type')->default('paid')->comment('유/무상 (paid/free)');
            $table->string('manager')->nullable()->comment('담당자');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_logs');
        Schema::dropIfExists('equipments');
    }
};
