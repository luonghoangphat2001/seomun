<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_option_groups', function (Blueprint $table) {
            if (!Schema::hasColumn('product_option_groups', 'product_option_group_tab')) {
                $table->string('product_option_group_tab', 100)->nullable();
            }
        });

        Schema::table('product_options', function (Blueprint $table) {

            if (!Schema::hasColumn('product_options', 'deleted_at')) {
                $table->softDeletes();
            }

            if (!Schema::hasColumn('product_options', 'deleted_by')) {
                $table->foreignId('deleted_by')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_option_groups', function (Blueprint $table) {
            $table->dropColumn('product_option_group_tab');
        });

        Schema::table('product_options', function (Blueprint $table) {
            if (Schema::hasColumn('product_options', 'deleted_at')) {
                $table->dropSoftDeletes();
                $table->dropColumn('deleted_by');
            }
        });
    }
};
