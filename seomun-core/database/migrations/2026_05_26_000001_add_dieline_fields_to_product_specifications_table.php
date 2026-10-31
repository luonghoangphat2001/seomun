<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_specifications', function (Blueprint $table) {
            // Whether dieline download is available for this product
            $table->boolean('dieline_enabled')->default(false)->after('notes')
                ->comment('칼선 다운로드 가능 여부 (Dieline Download Available)');

            // Extra margin beyond trim size (typically ~2mm)
            $table->decimal('dieline_margin_mm', 5, 2)->default(2.00)->after('dieline_enabled')
                ->comment('칼선 여백 (Dieline margin beyond trim size, mm)');
        });
    }

    public function down(): void
    {
        Schema::table('product_specifications', function (Blueprint $table) {
            $table->dropColumn(['dieline_enabled', 'dieline_margin_mm']);
        });
    }
};
