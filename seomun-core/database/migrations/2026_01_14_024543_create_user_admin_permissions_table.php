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
        Schema::create('user_admin_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->comment('User who has this permission');
            $table->foreignId('admin_permission_id')->constrained('admin_permissions')->cascadeOnDelete()->comment('Admin permission assigned to user');
            $table->string('status', 20)->default('active')->comment('Status: active, inactive');
            $table->date('grant_date')->comment('Date when permission was granted');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->comment('Registrant (admin user who assigned this permission)');
            $table->timestamps();
            $table->softDeletes();

            // Unique constraint: one user can have the same permission only once
            $table->unique(['user_id', 'admin_permission_id']);

            // Indexes for filtering
            $table->index('user_id');
            $table->index('admin_permission_id');
            $table->index('status');
            $table->index('grant_date');
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_admin_permissions');
    }
};
