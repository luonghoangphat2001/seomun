<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('logo', 500)->nullable();
            $table->string('address', 500)->nullable();
            $table->string('email')->nullable();
            $table->string('phone_number', 30)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_settings');
    }
};
