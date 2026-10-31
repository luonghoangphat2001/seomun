<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_design_review_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('token_hash', 64)->unique();
            $table->foreignId('created_by_user_id')->constrained('users')->restrictOnDelete();
            $table->timestamp('expires_at')->index();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_design_review_batch_versions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_design_review_batch_id');
            $table->unsignedBigInteger('order_item_design_version_id');
            $table->timestamps();

            $table->unique(['order_design_review_batch_id', 'order_item_design_version_id'], 'review_batch_version_unique');
            $table->foreign('order_design_review_batch_id', 'design_review_batch_version_batch_fk')
                ->references('id')
                ->on('order_design_review_batches')
                ->cascadeOnDelete();
            $table->foreign('order_item_design_version_id', 'design_review_batch_version_version_fk')
                ->references('id')
                ->on('order_item_design_versions')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_design_review_batch_versions');
        Schema::dropIfExists('order_design_review_batches');
    }
};
