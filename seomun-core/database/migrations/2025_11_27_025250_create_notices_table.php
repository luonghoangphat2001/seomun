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
        Schema::create('notices', function (Blueprint $table) {
            // 1. Identification
            $table->id();
            $table->string('title', 255)->comment('Notice title');
            $table->text('content')->comment('Main content of the notice');
            $table->json('attachments')->nullable()->comment('JSON array of attached file paths');

            // 2. Classification & Status
            $table->string('type', 50)->default('other')->comment('Type: orders, product_news, service, events, shipping_delivery, other');
            $table->boolean('is_pinned')->default(false)->comment('Whether the notice is pinned to the top');
            $table->boolean('is_active')->default(true)->comment('Active status for visibility');
            $table->integer('view_count')->default(0)->comment('Total number of views');

            // 3. Scheduling & Targeting
            $table->timestamp('published_at')->nullable()->comment('Date and time to start displaying the notice');
            $table->timestamp('expires_at')->nullable()->comment('Date and time to stop displaying the notice');

            // Target audience: "all" or specific customer IDs
            $table->json('exposure_target')->nullable()->comment('Visibility target: "all" or array of customer IDs');

            // Display location: main, login, dashboard, etc.
            $table->string('exposure_location', 50)->nullable()->comment('Target UI location for display');

            // 4. Ownership & System Timestamps
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->comment('Admin user who created this notice');
            $table->timestamps();
            $table->softDeletes();

            // 5. Query Optimization (Indexes)
            $table->index('type');
            $table->index('is_active');
            $table->index('is_pinned');
            $table->index('published_at');
            $table->index('exposure_location');
            $table->index('created_by');

            // Compound index for optimized filtering of active, pinned, and scheduled posts
            $table->index(['is_active', 'is_pinned', 'published_at'], 'idx_notice_status_visibility');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notices');
    }
};
