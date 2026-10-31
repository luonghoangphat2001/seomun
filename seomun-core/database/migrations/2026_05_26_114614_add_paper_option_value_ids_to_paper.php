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
        Schema::table('papers', function (Blueprint $table) {
            if (! Schema::hasColumn('papers', 'paper_type_option_value_id')) {
                $table->unsignedBigInteger('paper_type_option_value_id')
                    ->nullable()
                    ->after('specification');
            }

            if (! Schema::hasColumn('papers', 'paper_color_option_value_id')) {
                $table->unsignedBigInteger('paper_color_option_value_id')
                    ->nullable()
                    ->after('paper_type_option_value_id');
            }

            if (! Schema::hasColumn('papers', 'paper_weight_option_value_id')) {
                $table->unsignedBigInteger('paper_weight_option_value_id')
                    ->nullable()
                    ->after('paper_color_option_value_id');
            }

            // optional foreign keys
            $table->foreign('paper_type_option_value_id')
                ->references('id')
                ->on('erp_options');

            $table->foreign('paper_color_option_value_id')
                ->references('id')
                ->on('erp_options');

            $table->foreign('paper_weight_option_value_id')
                ->references('id')
                ->on('erp_options');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('papers', function (Blueprint $table) {
            $table->dropForeign(['paper_type_option_value_id']);
            $table->dropForeign(['paper_color_option_value_id']);
            $table->dropForeign(['paper_weight_option_value_id']);

            $table->dropColumn([
                'paper_type_option_value_id',
                'paper_color_option_value_id',
                'paper_weight_option_value_id',
            ]);
        });
    }
};
