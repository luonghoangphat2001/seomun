<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('pricing_profile_id')->nullable()->after('category_id')->constrained()->nullOnDelete();
            $table->enum('pricing_structure', ['single', 'cover_inner'])->default('single')->after('pricing_profile_id');
            $table->index('pricing_profile_id');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['pricing_profile_id']);
            $table->dropIndex(['pricing_profile_id']);
            $table->dropColumn(['pricing_profile_id', 'pricing_structure']);
        });
    }
};
