<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bundle_tiers', function (Blueprint $table) {
            $table->id();
            $table->decimal('bundle_value', 8, 2);
            $table->string('label', 50)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('bundle_value', 'bundle_tiers_bundle_value_unique');
        });

        $now = now();
        foreach (
            [
                ['bundle_value' => 1.00, 'label' => '1건', 'sort_order' => 100],
                ['bundle_value' => 2.00, 'label' => '2건', 'sort_order' => 200],
                ['bundle_value' => 3.00, 'label' => '3건', 'sort_order' => 300],
                ['bundle_value' => 5.00, 'label' => '5건', 'sort_order' => 500],
            ] as $row
        ) {
            DB::table('bundle_tiers')->updateOrInsert(
                ['bundle_value' => $row['bundle_value']],
                [
                    'label' => $row['label'],
                    'sort_order' => $row['sort_order'],
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        if (! Schema::hasColumn('product_quantity_prices', 'bundle_tier_id')) {
            Schema::table('product_quantity_prices', function (Blueprint $table) {
                $table->foreignId('bundle_tier_id')
                    ->nullable()
                    ->after('quantity_price_tier_id')
                    ->constrained('bundle_tiers')
                    ->restrictOnDelete();
            });
        }

        $defaultBundleTierId = DB::table('bundle_tiers')->where('bundle_value', 1.00)->value('id');
        if ($defaultBundleTierId) {
            DB::table('product_quantity_prices')
                ->whereNull('bundle_tier_id')
                ->update(['bundle_tier_id' => $defaultBundleTierId]);
        }

        if ($this->hasIndex('product_quantity_prices', 'product_quantity_prices_product_tier_unique')) {
            Schema::table('product_quantity_prices', function (Blueprint $table) {
                $table->dropUnique('product_quantity_prices_product_tier_unique');
            });
        }

        if (! $this->hasIndex('product_quantity_prices', 'product_quantity_prices_product_tier_bundle_unique')) {
            Schema::table('product_quantity_prices', function (Blueprint $table) {
                $table->unique(
                    ['product_id', 'quantity_price_tier_id', 'bundle_tier_id'],
                    'product_quantity_prices_product_tier_bundle_unique'
                );
            });
        }
    }

    public function down(): void
    {
        if ($this->hasIndex('product_quantity_prices', 'product_quantity_prices_product_tier_bundle_unique')) {
            Schema::table('product_quantity_prices', function (Blueprint $table) {
                $table->dropUnique('product_quantity_prices_product_tier_bundle_unique');
            });
        }

        if (! $this->hasIndex('product_quantity_prices', 'product_quantity_prices_product_tier_unique')) {
            Schema::table('product_quantity_prices', function (Blueprint $table) {
                $table->unique(
                    ['product_id', 'quantity_price_tier_id'],
                    'product_quantity_prices_product_tier_unique'
                );
            });
        }

        if (Schema::hasColumn('product_quantity_prices', 'bundle_tier_id')) {
            Schema::table('product_quantity_prices', function (Blueprint $table) {
                $table->dropForeign(['bundle_tier_id']);
                $table->dropColumn('bundle_tier_id');
            });
        }

        Schema::dropIfExists('bundle_tiers');
    }

    private function hasIndex(string $table, string $index): bool
    {
        return DB::table('information_schema.statistics')
            ->where('table_schema', DB::getDatabaseName())
            ->where('table_name', $table)
            ->where('index_name', $index)
            ->exists();
    }
};
