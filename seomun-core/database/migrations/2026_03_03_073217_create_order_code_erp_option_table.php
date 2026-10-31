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
        Schema::create('order_code_erp_option', function (Blueprint $table) {
            // 1. Primary Key & Relationships
            $table->id();

            // Link to order_code_option_mappings table
            $table->foreignId('order_code_id')
                ->constrained('order_code_option_mappings')
                ->cascadeOnDelete()
                ->comment('Link to the order code mapping');

            // Link to erp_options table
            $table->foreignId('erp_option_id')
                ->constrained('erp_options')
                ->cascadeOnDelete()
                ->comment('Link to the specific ERP option');

            // 2. Conditions & Pricing Overrides
            $table->string('product_type_condition')
                ->nullable()
                ->comment('Display condition based on product type (e.g., specific category or material)');

            // Use 15,2 for high-value currencies (KRW/VND) to prevent overflow
            $table->decimal('osrc_um', 15, 2)
                ->nullable()
                ->default(null)
                ->comment('Per-product outsourcing unit price (overrides erp_options.osrc_um)');

            $table->decimal('osrc_um_min', 15, 2)
                ->nullable()
                ->default(null)
                ->comment('Minimum threshold for per-product outsourcing unit price');

            // 3. System Timestamps
            $table->timestamps();

            // 4. Constraints & Indexes
            // Prevent duplicate mapping of the same option to the same order code
            $table->unique(['order_code_id', 'erp_option_id'], 'idx_order_code_erp_option_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_code_erp_option');
    }
};
