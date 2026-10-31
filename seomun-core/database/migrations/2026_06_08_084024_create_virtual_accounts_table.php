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
        Schema::create('virtual_accounts', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable(false);
            $table->string('provider', 50)->nullable(false);
            $table->string('account_number', 50)->nullable(false);
            $table->string('bank_code', 20)->nullable(false);
            $table->string('customer_name', 100)->nullable(false);
            $table->string('account_type', 20)->nullable(false);
            $table->string('status', 20)->nullable(false);
            $table->timestamp('issued_at')->nullable(false);
            $table->timestamp('closed_at')->nullable();
            $table->unique('account_number', 'uk_account_number');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('virtual_accounts');
    }
};
