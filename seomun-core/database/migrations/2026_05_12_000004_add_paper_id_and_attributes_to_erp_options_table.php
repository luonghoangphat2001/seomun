<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('erp_options', function (Blueprint $table) {
            $table->unsignedBigInteger('paper_id')->nullable()->after('size_option_id');
            $table->json('attributes')->nullable()->after('paper_id');
            $table->index('paper_id');
            $table->foreign('paper_id')->references('id')->on('papers')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('erp_options', function (Blueprint $table) {
            $table->dropForeign(['paper_id']);
            $table->dropIndex(['paper_id']);
            $table->dropColumn(['paper_id', 'attributes']);
        });
    }
};
