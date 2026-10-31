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
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('allow_file_upload')->default(false)->after('is_active')->comment('Allow file upload design mode');
            $table->boolean('allow_web_editor')->default(false)->after('allow_file_upload')->comment('Allow web editor design mode');
            $table->boolean('is_blank_canvas')->default(false)->after('allow_web_editor')->comment('Blank canvas mode (no template)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['allow_file_upload', 'allow_web_editor', 'is_blank_canvas']);
        });
    }
};
