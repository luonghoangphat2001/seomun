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
        Schema::create('user_quick_menu_items', function (Blueprint $table) {
            // 1. Identification & Relationship
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // 2. Menu Configuration
            $table->string('menu_code', 50)->comment('Unique identifier for menu: business_card, order_history, etc.');
            $table->string('label', 100)->comment('Display label in primary language');
            $table->string('label_en', 100)->nullable()->comment('English display label');
            $table->string('menu_type', 50)->nullable()->comment('Type: category, order, account, support');
            $table->string('route', 255)->nullable()->comment('Destination route or URL');

            // 3. Sorting & Order
            $table->integer('sort_order')->default(0)->comment('Display priority');

            // 4. Timestamps
            $table->timestamps();

            // 5. Query Optimization (Indexes)
            // Primary user filter
            $table->index('user_id');

            // Combined index for fetching sorted menu items for a user
            $table->index(['user_id', 'sort_order']);

            // Integrity: Ensure a user cannot have the same menu item twice
            $table->unique(['user_id', 'menu_code'], 'idx_user_menu_code_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_quick_menu_items');
    }
};
