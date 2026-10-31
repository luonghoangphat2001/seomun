<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create the table structure
        Schema::create('erp_option_dependencies', function (Blueprint $table) {
            $table->id();

            // Contextual Information
            $table->string('order_code')->nullable()
                ->comment('Target order code, or NULL for universal dependency');

            // Logic Triggers
            $table->foreignId('trigger_option_group_id')
                ->constrained('erp_option_groups')
                ->cascadeOnDelete()
                ->comment('The option group that initiates the dependency logic');

            $table->foreignId('trigger_option_id')
                ->constrained('erp_options')
                ->cascadeOnDelete()
                ->comment('The specific option that triggers the filtering rule');

            /**
             * Foreign Key Placeholder:
             * We define the column as unsignedBigInteger but do NOT use ->constrained() here.
             * This prevents the 1824 error if erp_size_options isn't created yet.
             */
            $table->unsignedBigInteger('size_option_id')->nullable()
                ->comment('Specific size constraint associated with this dependency');

            // Logic Targets
            $table->foreignId('affected_option_group_id')
                ->constrained('erp_option_groups')
                ->cascadeOnDelete()
                ->comment('The option group that will be restricted based on the trigger');

            $table->json('allowed_options')
                ->comment('JSON array of erp_options IDs that remain selectable in the affected group');

            $table->timestamps();

            // Performance Optimization (Indexes)
            $table->index('order_code', 'idx_dependency_order_code');
            $table->index(['trigger_option_group_id', 'trigger_option_id'], 'idx_dependency_trigger');
            $table->index('affected_option_group_id', 'idx_dependency_affected_group');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_option_dependencies');
    }
};
