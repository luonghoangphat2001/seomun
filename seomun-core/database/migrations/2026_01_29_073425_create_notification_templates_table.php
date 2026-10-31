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
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->comment('Template name');
            $table->string('template_number', 100)->nullable()->comment('External template number / code');
            $table->json('channel_configs')->comment('Channel configurations (email, notification talk, SMS)');
            $table->enum('usage_status', ['enabled', 'disabled'])->default('enabled')->comment('Usage status');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->comment('Registrant');
            $table->timestamps();
            $table->softDeletes();

            $table->index('template_number');
            $table->index('usage_status');
            $table->index('created_by');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};
