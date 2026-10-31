<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_options', function (Blueprint $table) {
            $table->string('option_code', 100)->nullable()->after('option_group_id');
            $table->string('field_name', 150)->nullable()->after('option_code');
            $table->string('category', 100)->nullable()->after('field_name');
        });
    }

    public function down(): void
    {
        Schema::table('product_options', function (Blueprint $table) {
            $table->dropColumn(['option_code', 'field_name', 'category']);
        });
    }
};
