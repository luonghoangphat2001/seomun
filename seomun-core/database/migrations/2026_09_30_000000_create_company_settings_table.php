<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('company_name', 200)->nullable();
            $table->string('business_registration_number', 20)->nullable();
            $table->string('address', 500)->nullable();
            $table->string('representative_name', 100)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('industry_type', 100)->nullable();
            $table->string('business_type', 100)->nullable();
            $table->string('stamp_path')->nullable();
            $table->string('stamp_mime_type', 100)->nullable();
            $table->string('stamp_original_name')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
