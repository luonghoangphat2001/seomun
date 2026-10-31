<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('papers', function (Blueprint $table) {
            // Predefined map: grammage (g/m²) → { thickness_mm, weight_g }
            // Example: { "80": { "thickness_mm": 0.09, "weight_g": 4.6 }, "120": { "thickness_mm": 0.13, "weight_g": 6.8 } }
            $table->json('grammage_data')->nullable()->after('paper_weight_option_value_id')
                ->comment('책등/중량 계산용 평량별 데이터 (grammage → thickness_mm, weight_g)');
        });
    }

    public function down(): void
    {
        Schema::table('papers', function (Blueprint $table) {
            $table->dropColumn('grammage_data');
        });
    }
};
