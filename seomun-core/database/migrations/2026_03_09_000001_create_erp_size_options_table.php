<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    private const RATIO_10_ORDER_CODES = [
        '1120',
        '1002',
        '1032',
        '1031',
        '1010',
        '1004',
        '1009',
        '1006',
        '1012',
        '1013',
        '1123',
        '1124',
        '5105',
        '5106',
        '1122',
        '1118',
    ];

    public function up(): void
    {
        // 1. Create the table structure first
        Schema::create('erp_size_options', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->index()->comment('Target order code for this size configuration');
            $table->string('name')->comment('Size name (e.g., A4, Business Card, Custom)');

            // Dimension Specifications
            $table->decimal('cutting_width', 12, 2);
            $table->decimal('cutting_height', 12, 2);
            $table->decimal('working_width', 12, 2);
            $table->decimal('working_height', 12, 2);

            // Custom Size Configuration
            $table->enum('size_type', ['standard', 'custom'])->default('standard');
            $table->boolean('is_custom_input_allowed')->default(false);
            $table->decimal('min_width', 12, 2)->nullable();
            $table->decimal('max_width', 12, 2)->nullable();
            $table->decimal('min_height', 12, 2)->nullable();
            $table->decimal('max_height', 12, 2)->nullable();
            $table->integer('width_step')->default(1);
            $table->integer('height_step')->default(1);

            $table->json('additional_widths')->nullable();
            $table->json('additional_heights')->nullable();
            $table->json('size_limit')->nullable();

            /**
             * IMPORTANT: Define the column ONLY.
             * Do NOT use ->constrained() here because we will link it
             * at the bottom of the function to avoid duplicate/timing errors.
             */
            $table->unsignedBigInteger('erp_option_id')->nullable();

            $table->boolean('is_default')->default(false);
            $table->unsignedTinyInteger('size_ratio')->default(100)
                ->comment('Design scale ratio: 10 or 100.');

            $table->timestamps();

            // Unique Constraint
            $table->unique(['order_code', 'name'], 'idx_size_option_unique');
        });

        // 2. Data Update (Optional for fresh migrations)
        DB::table('erp_size_options')
            ->whereIn('order_code', self::RATIO_10_ORDER_CODES)
            ->update(['size_ratio' => 10]);

        // 3. Establish the Circular Foreign Keys

        // Link erp_options -> erp_size_options
        Schema::table('erp_options', function (Blueprint $table) {
            $table->foreign('size_option_id')
                ->references('id')
                ->on('erp_size_options')
                ->onDelete('cascade');
        });

        // Link erp_size_options -> erp_options
        // This is where the error was; we only run this once.
        Schema::table('erp_size_options', function (Blueprint $table) {
            $table->foreign('erp_option_id')
                ->references('id')
                ->on('erp_options')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove constraints from erp_size_options first
        Schema::table('erp_size_options', function (Blueprint $table) {
            $table->dropForeign(['erp_option_id']);
        });

        // Remove constraints from erp_options
        Schema::table('erp_options', function (Blueprint $table) {
            $table->dropForeign(['size_option_id']);
        });

        Schema::dropIfExists('erp_size_options');
    }
};
