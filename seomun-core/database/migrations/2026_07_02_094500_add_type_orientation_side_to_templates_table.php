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
            $table->string('type')
                ->nullable()
                ->after('size_option_id')
                ->comment('Fold type of the template');
            $table->string('orientation')
                ->nullable()
                ->after('type')
                ->comment('Print orientation');
            $table->string('side')
                ->nullable()
                ->after('orientation')
                ->comment('Number of sides');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn(['type', 'orientation', 'side']);
        });
    }
};
