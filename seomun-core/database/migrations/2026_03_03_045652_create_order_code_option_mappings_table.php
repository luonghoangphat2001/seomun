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
        Schema::create('order_code_option_mappings', function (Blueprint $table) {
            // 1. Identification
            $table->id();
            $table->string('order_code')->unique()->comment('DPTIA order code (e.g., 9403)');
            $table->string('name')->comment('Order code description');

            // 2. Media Configuration
            // Named 'url_image' directly to avoid the need for renameColumn
            $table->string('url_image', 500)->nullable()->comment('URL or path to image for this order code');

            // 3. System Timestamps
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_code_option_mappings');
    }
};
