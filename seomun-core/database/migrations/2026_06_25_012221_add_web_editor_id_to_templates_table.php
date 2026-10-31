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
        Schema::table('templates', function (Blueprint $table) {
            $table->foreignId('web_editor_id')
                ->nullable()
                ->constrained('web_editors')
                ->cascadeOnDelete()
                ->after('size_option_id')
                ->comment('Web editor used by this template');

            $table->index('web_editor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropForeign(['web_editor_id']);
            $table->dropColumn('web_editor_id');
        });
    }
};
