<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Allow additional shipping_method values (e.g. direct delivery) without MySQL ENUM maintenance.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY shipping_method VARCHAR(32) NOT NULL DEFAULT 'courier'");
        }

        if ($driver === 'pgsql') {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('shipping_method', 32)->default('courier')->change();
            });
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY shipping_method VARCHAR(32) NOT NULL DEFAULT 'courier'");
        }
    }
};
