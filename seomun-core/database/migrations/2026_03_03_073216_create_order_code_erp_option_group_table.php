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
        Schema::create('order_code_erp_option_group', function (Blueprint $table) {
            // 1. Primary Key & Main Relationships
            $table->id();

            // Link to order_code_option_mappings table
            $table->foreignId('order_code_id')
                ->constrained('order_code_option_mappings')
                ->cascadeOnDelete()
                ->comment('Link to the order code mapping');

            // Link to erp_option_groups table
            $table->foreignId('erp_option_group_id')
                ->constrained('erp_option_groups')
                ->cascadeOnDelete()
                ->comment('Link to the ERP option group');

            // 2. Default Values Configuration
            // Link to a specific default option within the group
            $table->foreignId('default_option_id')
                ->nullable()
                ->constrained('erp_options')
                ->nullOnDelete()
                ->comment('Pre-selected default option for this group');

            // Flag to indicate if "None" is the default selection
            $table->boolean('default_is_none')
                ->default(false)
                ->comment('Whether the default selection is "None/No option"');

            // 3. System Timestamps
            $table->timestamps();

            // 4. Constraints & Indexes
            // Ensure a specific option group is linked only once to an order code
            $table->unique(['order_code_id', 'erp_option_group_id'], 'idx_order_code_group_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_code_erp_option_group');
    }
};
