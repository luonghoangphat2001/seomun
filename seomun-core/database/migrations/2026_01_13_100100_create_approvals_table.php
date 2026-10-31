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
        Schema::create('approvals', function (Blueprint $table) {
            $table->id();
            $table->string('approvable_type'); // Order, etc.
            $table->unsignedBigInteger('approvable_id'); // Order ID, etc.
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade')->comment('요청자 (User who requested approval)');
            $table->string('status')->default('pending')->comment('승인 상태: pending, approved, rejected, cancelled');
            $table->unsignedTinyInteger('current_stage')->default(1)->comment('현재 결재 단계');
            $table->unsignedTinyInteger('total_stages')->default(1)->comment('총 결재 단계 수');
            $table->json('approval_flow')->nullable()->comment('결재 흐름 (Approval flow stages)');
            $table->text('request_reason')->nullable()->comment('요청 사유');
            $table->text('reject_reason')->nullable()->comment('거절 사유');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['approvable_type', 'approvable_id']);
            $table->index('requested_by');
            $table->index('status');
            $table->index('requested_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approvals');
    }
};
