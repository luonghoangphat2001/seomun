<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_item_design_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_design_workflow_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->unsignedInteger('version');
            $table->string('file_path');
            $table->string('file_name');
            $table->text('designer_note')->nullable();
            $table->foreignId('submitted_by_user_id')->constrained('users')->restrictOnDelete();
            $table->string('customer_response', 20)->default('pending')->index();
            $table->text('customer_note')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->unique(['order_item_design_workflow_id', 'version'], 'design_workflow_version_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_item_design_versions');
    }
};
