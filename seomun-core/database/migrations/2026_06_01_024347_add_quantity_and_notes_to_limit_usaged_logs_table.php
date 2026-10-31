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
        Schema::table('limit_usaged_logs', function (Blueprint $table) {
            $table->integer('quantity')->nullable()->after('usage_amount');
            $table->text('notes')->nullable()->after('description');
            $table->string('transaction_person')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('limit_usaged_logs', function (Blueprint $table) {
            $table->dropColumn(['quantity', 'notes', 'transaction_person']);
        });
    }
};
