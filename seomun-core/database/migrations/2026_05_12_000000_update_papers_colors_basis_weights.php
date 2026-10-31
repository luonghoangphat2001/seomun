<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Schema::table('papers', function (Blueprint $table) {
        //     $table->dropColumn(['colors', 'basis_weights']);
        // });

        Schema::table('papers', function (Blueprint $table) {
            $table->unsignedBigInteger('paper_type_option_value_id')->nullable()->after('specification');
            $table->unsignedBigInteger('paper_color_option_value_id')->nullable()->after('paper_type_option_value_id');
            $table->unsignedBigInteger('paper_weight_option_value_id')->nullable()->after('paper_color_option_value_id');
        });
    }

    public function down(): void
    {
        Schema::table('papers', function (Blueprint $table) {
            $table->dropColumn(['paper_type_option_value_id', 'paper_color_option_value_id', 'paper_weight_option_value_id']);
        });

        // Schema::table('papers', function (Blueprint $table) {
        //     $table->json('colors')->nullable()->after('specification');
        //     $table->json('basis_weights')->nullable()->after('pattern');
        // });
    }
};
