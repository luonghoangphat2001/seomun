<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_artworks', function (Blueprint $table) {
            $table->string('design_title', 255)->nullable()->comment('제목');
            $table->json('file_metadata')->nullable()->after('metadata')->comment('Uploaded file metadata (url, name, size, mime)');
            $table->boolean('print_as_is')->nullable()->default(false)->comment('그대로 인쇄');
            $table->boolean('print_without_proof')->nullable()->default(false)->comment('교정 확인 없이 인쇄');
            $table->string('size', 50)->nullable()->after('side')->comment('Size dimension e.g., 92x50mm');
            $table->index('size');
        });
    }

    public function down(): void
    {
        Schema::table('order_artworks', function (Blueprint $table) {
            $table->dropColumn([
                'design_title',
                'file_metadata',
                'print_as_is',
                'print_without_proof',
            ]);
            $table->dropIndex(['size']);
            $table->dropColumn('size');
        });
    }
};
