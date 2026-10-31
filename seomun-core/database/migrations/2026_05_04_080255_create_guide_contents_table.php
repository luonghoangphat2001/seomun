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
        Schema::create('guide_contents', function (Blueprint $table) {
            // 1. Identification
            $table->id();
            $table->timestamps();
            $table->softDeletes();

            // 2. Main Content
            $table->string('title', 255)->comment('Guide title');
            $table->text('content')->comment('Main content of the Guide');
            $table->json('attachments')->nullable()->comment('JSON array of attached file paths');

            // 3. Classification & Status
            $table->string('type', 50)->default('general')->comment('Type: PRODUCTION_GUIDE, PRECAUTION, SHIPPING, USAGE_GUIDE, etc.');
            $table->boolean('is_active')->default(true)->comment('Active status for visibility');

            // 4. Scheduling & Targeting
            $table->timestamp('published_at')->nullable()->comment('Date and time to start displaying the guide');
            $table->timestamp('expires_at')->nullable()->comment('Date and time to stop displaying the guide');

            // Target audience: "all" or specific customer IDs
            $table->json('exposure_target')->nullable()->comment('Visibility target: "all" or array of customer IDs');

            // 5. Ownership & System Timestamps
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->comment('Admin user who created this guide');
        });

        // 5. Query Optimization (Indexes)
        Schema::table('guide_contents', function (Blueprint $table) {
            $table->index('type');
            $table->index('is_active');
            $table->index('published_at');
            $table->index('created_by');
            $table->index(['is_active', 'published_at', 'created_by'], 'idx_guide_content_status_visibility');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_contents');
    }
};