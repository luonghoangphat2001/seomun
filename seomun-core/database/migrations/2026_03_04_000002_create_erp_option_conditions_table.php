<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('erp_option_conditions', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->nullable()->comment('Specific order code or null if universally applicable');
            $table->foreignId('option_group_id')->constrained('erp_option_groups')->cascadeOnDelete()->comment('Option group');
            $table->foreignId('option_id')->constrained('erp_options')->cascadeOnDelete()->comment('Option');
            $table->string('condition_type')->comment('Condition type: hide/show');
            $table->text('condition_expression')->comment('Condition expression: order_code_range, item_code_range, option_value_contains');
            $table->timestamps();

            $table->index(['order_code'], 'idx_order_code');
            $table->index(['option_group_id', 'option_id'], 'idx_option');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_option_conditions');
    }
};
