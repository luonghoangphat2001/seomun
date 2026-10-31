<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('printing_prices', function (Blueprint $table) {
            $table->string('paper_size_division_code', 32)
                ->nullable()
                ->after('book_printing_size_type');
        });
    }

    public function down(): void
    {
        Schema::table('printing_prices', function (Blueprint $table) {
            $table->dropColumn('paper_size_division_code');
        });
    }
};
