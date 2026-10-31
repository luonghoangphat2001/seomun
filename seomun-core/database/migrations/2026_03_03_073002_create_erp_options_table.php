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
        Schema::create('erp_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('erp_option_group_id')->constrained('erp_option_groups')->cascadeOnDelete()->comment('ERP Option Group ID');
            $table->string('code')->comment('Option code (e.g., 90101)');
            $table->string('label')->comment('Option label');
            $table->string('value')->nullable()->comment('Option value');
            $table->decimal('additional_price', 10, 2)->default(0)->comment('Additional price');
            $table->integer('sort_order')->default(0)->comment('Sort order');
            $table->boolean('is_active')->default(true)->comment('Is active');
            $table->decimal('osrc_um', 10, 2)->nullable()->comment('Outsourcing unit price (OSRC_UM from BIZLECT)');
            $table->string('preview_image')->nullable()->comment('URL to preview image');
            $table->unsignedBigInteger('size_option_id')->nullable();
            $table->index('size_option_id');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['erp_option_group_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('erp_options');
    }
};
