<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proxy_login_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('target_user_id')->constrained('users')->restrictOnDelete();
            $table->char('handoff_token_hash', 64)->unique();
            // Keep the audit session after its bearer token is revoked/expired.
            $table->foreignId('personal_access_token_id')->nullable()->constrained('personal_access_tokens')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamp('handoff_consumed_at')->nullable()->index();
            $table->timestamp('ended_at')->nullable()->index();
            $table->timestamps();

            $table->index(['target_user_id', 'ended_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proxy_login_sessions');
    }
};
