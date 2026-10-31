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
        Schema::create('users', function (Blueprint $table) {
            // 1. Primary ID
            $table->id();

            // 3. Basic Info
            $table->string('username')->unique();
            $table->string('name');
            $table->string('email')->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // 4. Contact & Address
            $table->string('phone', 20)->nullable();
            $table->string('mobile', 20)->nullable();
            $table->string('postcode', 10)->nullable();
            $table->string('address')->nullable();
            $table->string('detailed_address')->nullable();

            // 5. Company / Org Info
            $table->string('authority')->nullable();
            $table->string('headquarters')->nullable();
            $table->string('business_office')->nullable();
            $table->string('team')->nullable();
            $table->string('position')->nullable();

            // 6. Status & Membership
            $table->string('status')->default('active');
            $table->string('registration_path')->default('direct');
            $table->string('member_type')->default('individual')->comment('Member type: individual, business');

            // 7. Approval Logic
            $table->string('approval_status')->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->boolean('individual_approval')->default(false)->comment('Individual Approval');
            $table->json('approval_line')->nullable()->comment('Approval Line Configuration');

            // 7b. Refund Account
            $table->string('refund_bank')->nullable()->comment('Bank name for refund');
            $table->string('refund_account_number')->nullable()->comment('Account number for refund');
            $table->string('refund_account_name')->nullable()->comment('Account holder name for refund');

            // 8. Agreements & Logs
            $table->boolean('agree_privacy')->default(false);
            $table->boolean('agree_terms')->default(false);
            $table->timestamp('agreed_at')->nullable();
            $table->timestamp('last_login_at')->nullable();

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
