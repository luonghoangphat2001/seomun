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
        Schema::create('inquiries', function (Blueprint $table) {
            // 1. Identification & Relationships
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');

            // 2. Inquiry Details
            $table->string('category')->comment('Inquiry category: product, payment, delivery, etc.');
            $table->string('title');
            $table->text('content');
            $table->string('order_number')->nullable()->comment('Associated order number if applicable');
            $table->string('contact')->comment('User contact information');

            // 3. Status & Administration
            $table->string('status')->default('pending')->comment('pending, in_progress, completed');

            // 4. Staff Response (Reply Information)
            $table->foreignId('replied_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reply_contact_phone')->nullable()->comment('Phone number used for the reply');
            $table->text('reply_content')->nullable();
            $table->boolean('is_edited_reply')->default(false)->comment('Flag if the reply was modified after posting');

            // 5. System Timestamps
            $table->timestamps();
            $table->softDeletes();

            // 6. Query Optimization (Indexes)
            $table->index('user_id');
            $table->index('product_id');
            $table->index('category');
            $table->index('status');
            $table->index('order_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
