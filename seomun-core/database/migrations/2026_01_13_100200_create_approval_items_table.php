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
        Schema::create('approval_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_id')->constrained('approvals')->onDelete('cascade');
            $table->unsignedTinyInteger('stage')->comment('결재 단계 (Stage number)');
            $table->foreignId('approver_id')->constrained('users')->onDelete('cascade')->comment('결재자 (Approver user)');
            $table->string('status')->default('pending')->comment('결재 상태: pending, approved, rejected, skipped');
            $table->text('comment')->nullable()->comment('결재 의견');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            $table->index('approval_id');
            $table->index('approver_id');
            $table->index('status');
            $table->index(['approval_id', 'stage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_items');
    }
};
