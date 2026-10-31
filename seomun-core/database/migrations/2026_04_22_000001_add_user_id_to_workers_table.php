<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('workers', 'customer_id')) {
            Schema::table('workers', function (Blueprint $table) {
                $table->unsignedBigInteger('customer_id')->nullable()->after('id')->index();
            });
        }

        // Delete rows with no customer_id or with invalid customer_id
        DB::table('workers')->whereNull('customer_id')->delete();
        DB::table('workers')
            ->whereNotIn('customer_id', DB::table('customers')->pluck('id'))
            ->delete();

        Schema::table('workers', function (Blueprint $table) {
            $table->unsignedBigInteger('customer_id')->nullable(false)->change();
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
        });
    }
};
