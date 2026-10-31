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
        Schema::table('order_artworks', function (Blueprint $table) {
            $table->string('revised_file_path')->nullable()->after('preview_image_path')->comment('Admin-uploaded revised design file path');
            $table->string('revised_file_name')->nullable()->after('revised_file_path')->comment('Original filename of revised design');
            $table->string('rejection_reason')->nullable()->after('revised_file_name')->comment('Customer rejection reason for design');
            $table->timestamp('confirmation_requested_at')->nullable()->after('rejection_reason');
            $table->timestamp('confirmed_at')->nullable()->after('confirmation_requested_at');
            $table->timestamp('rejected_at')->nullable()->after('confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('order_artworks', function (Blueprint $table) {
            $table->dropColumn([
                'revised_file_path',
                'revised_file_name',
                'rejection_reason',
                'confirmation_requested_at',
                'confirmed_at',
                'rejected_at',
            ]);
        });
    }
};
