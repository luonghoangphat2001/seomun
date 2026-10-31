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
        Schema::create('faqs', function (Blueprint $table) {
            // 1. Identification & Classification
            $table->id();
            $table->string('category', 100)->nullable()->comment('FAQ category: order, payment, delivery, etc.');

            // 2. Content
            $table->string('question', 500)->comment('The frequently asked question');
            $table->text('answer')->comment('The detailed answer to the question');

            // 3. Status & Ordering
            $table->integer('sort_order')->default(0)->comment('Display priority (lower numbers shown first)');
            $table->boolean('is_active')->default(true)->comment('Visibility status');
            $table->integer('view_count')->default(0)->comment('Total number of times this FAQ was viewed');

            // 4. Ownership & System Timestamps
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->comment('Admin who created this entry');
            $table->timestamps();
            $table->softDeletes();

            // 5. Query Optimization (Indexes)
            $table->index('category');
            $table->index('is_active');
            $table->index('sort_order');

            // Compound index for optimized filtering by category and status while maintaining sort order
            $table->index(['is_active', 'category', 'sort_order'], 'idx_faq_status_category_sort');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
