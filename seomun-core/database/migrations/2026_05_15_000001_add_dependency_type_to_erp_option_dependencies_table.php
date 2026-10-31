<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('erp_option_dependencies', function (Blueprint $table) {
            $table->string('dependency_type', 30)
                ->default('filter_options')
                ->after('affected_option_group_id')
                ->comment('Type of dependency: filter_options or hide_group');

            $table->json('allowed_options')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('erp_option_dependencies', function (Blueprint $table) {
            $table->dropColumn('dependency_type');
        });
    }
};