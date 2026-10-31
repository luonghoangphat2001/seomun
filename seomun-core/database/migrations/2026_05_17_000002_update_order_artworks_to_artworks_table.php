<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_artworks', function (Blueprint $table) {
            try { $table->dropForeign(['user_id']); } catch (\Exception $e) {}
            try { $table->dropForeign(['order_id']); } catch (\Exception $e) {}
            try { $table->dropForeign(['order_item_id']); } catch (\Exception $e) {}
            try { $table->dropForeign(['design_mode_id']); } catch (\Exception $e) {}
        });

        Schema::table('order_artworks', function (Blueprint $table) {
            $table->dropColumn([
                'user_id',
                'order_id',
                'order_item_id',
                'design_mode_id',
            ]);
        });

        Schema::table('order_artworks', function (Blueprint $table) {
            $table->dropColumn('design_group_id');
        });

        Schema::table('order_artworks', function (Blueprint $table) {
            $table->foreignId('design_group_id')
                ->nullable()
                ->constrained('design_groups')
                ->cascadeOnDelete();
        });

        Schema::table('order_artworks', function (Blueprint $table) {
            $table->dropColumn([
                'text_fields',
                'size',
                'design_title',
                'file_metadata',
                'print_as_is',
                'print_without_proof',
                'revised_file_path',
                'revised_file_name',
                'rejection_reason',
                'confirmation_requested_at',
                'confirmed_at',
                'rejected_at',
                'metadata',
            ]);

            $table->unique(['design_group_id', 'side']);
        });
    }

    public function down(): void
    {
        Schema::table('order_artworks', function (Blueprint $table) {
            $table->dropForeign(['design_group_id']);
            $table->dropColumn('design_group_id');
        });

        Schema::table('order_artworks', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('design_mode_id')->nullable()->constrained('product_design_modes')->nullOnDelete();
            $table->string('design_group_id', 36)->nullable()->index();
        });

        Schema::table('order_artworks', function (Blueprint $table) {
            $table->string('design_title', 255)->nullable();
            $table->json('file_metadata')->nullable();
            $table->boolean('print_as_is')->default(false);
            $table->boolean('print_without_proof')->default(false);
            $table->string('size', 50)->nullable();
            $table->json('text_fields')->nullable();
            $table->string('revised_file_path')->nullable();
            $table->string('revised_file_name')->nullable();
            $table->string('rejection_reason')->nullable();
            $table->timestamp('confirmation_requested_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->json('metadata')->nullable();

            $table->dropUnique(['design_group_id', 'side']);
        });
    }
};