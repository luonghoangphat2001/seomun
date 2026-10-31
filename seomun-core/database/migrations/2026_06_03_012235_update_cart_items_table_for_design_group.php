<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->foreignId('design_group_id')
                ->nullable()
                ->constrained('design_groups')
                ->nullOnDelete();

            $table->dropColumn('design_id');

            if (Schema::hasColumn('cart_items', 'design_ids')) {
                $table->dropColumn('design_ids');
            }

            if (Schema::hasColumn('cart_items', 'bulk_order_batch_id')) {
                $table->dropForeign(['bulk_order_batch_id']);
                $table->dropColumn('bulk_order_batch_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropForeign(['design_group_id']);
            $table->dropColumn('design_group_id');

            $table->unsignedBigInteger('design_id')->nullable();
            $table->foreign('design_id')->references('id')->on('designs')->nullOnDelete();

            $table->json('design_ids')->nullable();

            $table->unsignedBigInteger('bulk_order_batch_id')->nullable();
            $table->foreign('bulk_order_batch_id')->references('id')->on('bulk_order_batches')->nullOnDelete();
        });
    }
};
