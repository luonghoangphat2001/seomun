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
        Schema::create('order_artworks', function (Blueprint $table) {
            // 1. Identification & Relationships
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('design_mode_id')->nullable()->constrained('product_design_modes')->nullOnDelete();

            // 2. Design Grouping & Side Information
            // Groups front + back records for one logical design (e.g., UUID)
            $table->string('design_group_id', 36)->nullable()->index();
            $table->string('side', 50)->nullable()->comment('Options: front, back, side_a, side_b');

            // 3. Content & Editor Data
            $table->json('text_fields')->nullable()->comment('Simple editor fields: name, phone, position, etc.');
            $table->json('layout_data')->nullable()->comment('Web editor serialized layout data (JSON)');
            $table->string('layout_s3_path')->nullable()->comment('S3 path for KonvaJS layout JSON/SVG file');

            // 4. Assets & Previews
            $table->string('logo_path')->nullable()->comment('Path to uploaded logo file');
            $table->string('preview_image_path')->nullable()->comment('Rendered preview thumbnail path');

            // 5. System Fields
            $table->json('metadata')->nullable();
            $table->timestamps();

            // 6. Indexes for Performance
            $table->index(['user_id', 'order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_artworks');
    }
};
