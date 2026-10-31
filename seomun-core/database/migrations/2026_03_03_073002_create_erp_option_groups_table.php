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
        Schema::create('erp_option_groups', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->comment('Option group code (e.g., OP901)');
            $table->string('label')->comment('Option group label');
            $table->string('display_type')->default('select')->comment('Display type: select, radio, checkbox');
            $table->boolean('is_required')->default(false)->comment('Whether option group is required');
            $table->integer('sort_order')->default(0)->comment('Sort order');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('erp_option_groups');
    }
};
