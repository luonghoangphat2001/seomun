<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inquiry_attachments', function (Blueprint $table) {
            $table->foreignId('comment_id')->nullable()->after('inquiry_id')
                ->constrained('inquiry_comments')->nullOnDelete()
                ->comment('Associated reply comment ID (null = question attachment)');
        });
    }

    public function down(): void
    {
        Schema::table('inquiry_attachments', function (Blueprint $table) {
            $table->dropForeign(['comment_id']);
            $table->dropColumn('comment_id');
        });
    }
};
