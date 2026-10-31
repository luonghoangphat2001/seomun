<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_feed_syncs', function (Blueprint $table) {
            $table->id();
            $table->string('account_identity', 64)->unique();
            $table->string('account_key', 20);
            $table->string('job_id', 32)->nullable();
            $table->timestamp('requested_at')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('completed_through')->nullable();
            $table->timestamp('last_success_at')->nullable();
            $table->timestamp('last_error_at')->nullable();
            $table->integer('last_error_code')->nullable();
            $table->timestamps();
        });

        Schema::create('bank_deposits', function (Blueprint $table) {
            $table->id();
            $table->string('account_identity', 64);
            $table->string('account_key', 20);
            $table->string('provider_tid', 32);
            $table->decimal('amount', 15, 2);
            $table->timestamp('deposited_at');
            $table->json('remarks');
            $table->string('status', 20)->default('unmatched')->index();
            $table->string('match_reason', 100)->nullable();
            $table->foreignId('payment_transaction_id')->nullable()->unique()->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->nullable()->unique()->constrained()->restrictOnDelete();
            $table->foreignId('matched_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->text('admin_note')->nullable();
            $table->timestamp('matched_at')->nullable();
            $table->timestamps();
            $table->unique(['account_identity', 'provider_tid'], 'bank_deposit_provider_unique');
            $table->index(['account_identity', 'status', 'amount']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_deposits');
        Schema::dropIfExists('bank_feed_syncs');
    }
};
