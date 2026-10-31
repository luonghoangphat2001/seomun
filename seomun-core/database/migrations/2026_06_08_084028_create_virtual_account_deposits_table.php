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
        Schema::create('virtual_account_deposits', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('virtual_account_id')->nullable(false);
            $table->string('transaction_key', 200)->nullable();
            $table->string('depositor_name', 100)->nullable();
            $table->decimal('amount', 18, 2)->nullable(false);
            $table->string('status', 20)->nullable(false);
            $table->timestamp('deposited_at')->nullable();
            $table->json('raw_payload')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('virtual_account_deposits');
    }
};
