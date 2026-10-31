<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('design_groups', function (Blueprint $table) {
            $table->string('preview_pdf_url')->nullable()->after('preview_image_path');
        });
    }

    public function down(): void
    {
        Schema::table('design_groups', function (Blueprint $table) {
            $table->dropColumn('preview_pdf_url');
        });
    }
};
