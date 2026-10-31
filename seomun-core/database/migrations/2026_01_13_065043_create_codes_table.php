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
        Schema::create('codes', function (Blueprint $table) {
            $table->id();

            $table->string('code');
            $table->string('name');
            $table->json('properties')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('customers', function (Blueprint $table) {
            /**
             * 1. Check if the column exists; if not, create it.
             * We use unsignedBigInteger to match the 'id' type of the codes table.
             */
            if (! Schema::hasColumn('customers', 'branch_in_charge')) {
                $table->unsignedBigInteger('branch_in_charge')
                    ->nullable()
                    ->after('id') // Position it after ID for clean structure
                    ->comment('Foreign key referencing the codes table for branch assignment');
            }

            /**
             * 2. Apply the Foreign Key Constraint.
             * This ensures referential integrity between Customers and Codes.
             */
            $table->foreign('branch_in_charge')
                ->references('id')
                ->on('codes')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Drop the constraint first to avoid SQL errors
            $table->dropForeign(['branch_in_charge']);

            // Optionally drop the column if you want a full rollback
            $table->dropColumn('branch_in_charge');
        });

        Schema::dropIfExists('codes');
    }
};
