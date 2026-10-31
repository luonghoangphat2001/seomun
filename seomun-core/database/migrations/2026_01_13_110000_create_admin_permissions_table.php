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
        Schema::create('admin_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Authority / permission name');
            $table->string('description')->nullable()->comment('Permission description');
            $table->string('usage_status', 20)->default('active')->comment('Usage status: active, inactive');
            $table->json('menu_permissions')->nullable()->comment('Per-menu permissions (view/register/edit/delete/approval)');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->comment('Registrant (admin user who created this permission)');
            $table->timestamps();
            $table->softDeletes();

            $table->index('name');
            $table->index('usage_status');
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_permissions');
    }
};
