<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_option_groups', function (Blueprint $table) {
            $table->boolean('info_icon_enabled')->default(false)->after('is_required');
            $table->text('info_content')->nullable()->after('info_icon_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('product_option_groups', function (Blueprint $table) {
            $table->dropColumn(['info_icon_enabled', 'info_content']);
        });
    }
};
