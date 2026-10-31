<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Master table quantity_price_tiers + pivot product_quantity_prices (product_id, tier_id, price, ...).
     */
    public function up(): void
    {
        Schema::create('quantity_price_tiers', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('quantity');
            $table->string('unit', 20)->default('sheets');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['quantity', 'unit'], 'quantity_price_tiers_quantity_unit_unique');
        });

        $defaultTiers = [
            ['quantity' => 50, 'unit' => 'sheets', 'sort_order' => 50],
            ['quantity' => 100, 'unit' => 'sheets', 'sort_order' => 100],
            ['quantity' => 200, 'unit' => 'sheets', 'sort_order' => 200],
            ['quantity' => 300, 'unit' => 'sheets', 'sort_order' => 300],
            ['quantity' => 400, 'unit' => 'sheets', 'sort_order' => 400],
            ['quantity' => 500, 'unit' => 'sheets', 'sort_order' => 500],
        ];

        $now = now();
        foreach ($defaultTiers as $row) {
            DB::table('quantity_price_tiers')->updateOrInsert(
                ['quantity' => $row['quantity'], 'unit' => $row['unit']],
                [
                    'sort_order' => $row['sort_order'],
                    'is_active' => true,
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }

        if (! Schema::hasColumn('product_quantity_prices', 'quantity_price_tier_id')) {
            Schema::table('product_quantity_prices', function (Blueprint $table) {
                $table->foreignId('quantity_price_tier_id')
                    ->nullable()
                    ->after('product_id')
                    ->constrained('quantity_price_tiers')
                    ->restrictOnDelete();
            });
        }

        $this->backfillTierIds();

        Schema::table('product_quantity_prices', function (Blueprint $table) {
            // MySQL may rely on the old unique index for FK(product_id),
            // so create a dedicated index before dropping it.
            if (! $this->hasIndex('product_quantity_prices', 'product_quantity_prices_product_id_idx')) {
                $table->index('product_id', 'product_quantity_prices_product_id_idx');
            }
        });

        if ($this->hasIndex('product_quantity_prices', 'product_quantity_price_unique')) {
            Schema::table('product_quantity_prices', function (Blueprint $table) {
                $table->dropUnique('product_quantity_price_unique');
            });
        }

        $columnsToDrop = array_values(array_filter(
            ['quantity', 'unit', 'multiplier'],
            fn (string $column): bool => Schema::hasColumn('product_quantity_prices', $column)
        ));
        if (! empty($columnsToDrop)) {
            Schema::table('product_quantity_prices', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }

        if (! Schema::hasColumn('product_quantity_prices', 'is_default')) {
            Schema::table('product_quantity_prices', function (Blueprint $table) {
                $table->boolean('is_default')->default(false)->after('production_days');
            });
        }

        $this->deduplicateProductTierRows();

        if (! $this->hasIndex('product_quantity_prices', 'product_quantity_prices_product_tier_unique')) {
            Schema::table('product_quantity_prices', function (Blueprint $table) {
                $table->unique(['product_id', 'quantity_price_tier_id'], 'product_quantity_prices_product_tier_unique');
            });
        }
    }

    private function backfillTierIds(): void
    {
        if (! Schema::hasColumn('product_quantity_prices', 'quantity') || ! Schema::hasColumn('product_quantity_prices', 'unit')) {
            return;
        }

        $rows = DB::table('product_quantity_prices')->get();

        foreach ($rows as $row) {
            $unit = $row->unit ?? 'sheets';
            $tierId = DB::table('quantity_price_tiers')
                ->where('quantity', (int) $row->quantity)
                ->where('unit', $unit)
                ->value('id');

            if (! $tierId) {
                $tierId = DB::table('quantity_price_tiers')->insertGetId([
                    'quantity' => (int) $row->quantity,
                    'unit' => $unit,
                    'sort_order' => (int) $row->quantity,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('product_quantity_prices')
                ->where('id', $row->id)
                ->update(['quantity_price_tier_id' => $tierId]);
        }
    }

    private function hasIndex(string $table, string $index): bool
    {
        return DB::table('information_schema.statistics')
            ->where('table_schema', DB::getDatabaseName())
            ->where('table_name', $table)
            ->where('index_name', $index)
            ->exists();
    }

    private function deduplicateProductTierRows(): void
    {
        $duplicateGroups = DB::table('product_quantity_prices')
            ->select('product_id', 'quantity_price_tier_id', DB::raw('MIN(id) as keep_id'), DB::raw('COUNT(*) as aggregate_count'))
            ->whereNotNull('quantity_price_tier_id')
            ->groupBy('product_id', 'quantity_price_tier_id')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicateGroups as $group) {
            DB::table('product_quantity_prices')
                ->where('product_id', $group->product_id)
                ->where('quantity_price_tier_id', $group->quantity_price_tier_id)
                ->where('id', '!=', $group->keep_id)
                ->delete();
        }
    }

    public function down(): void
    {
        Schema::table('product_quantity_prices', function (Blueprint $table) {
            $table->dropUnique('product_quantity_prices_product_tier_unique');
        });

        Schema::table('product_quantity_prices', function (Blueprint $table) {
            $table->dropColumn(['is_default']);
        });

        Schema::table('product_quantity_prices', function (Blueprint $table) {
            $table->unsignedInteger('quantity')->default(1);
            $table->string('unit', 20)->default('sheets');
            $table->unsignedInteger('multiplier')->default(1);
        });

        $rows = DB::table('product_quantity_prices')->join(
            'quantity_price_tiers',
            'quantity_price_tiers.id',
            '=',
            'product_quantity_prices.quantity_price_tier_id'
        )->select(
            'product_quantity_prices.id',
            'quantity_price_tiers.quantity',
            'quantity_price_tiers.unit'
        )->get();

        foreach ($rows as $row) {
            DB::table('product_quantity_prices')
                ->where('id', $row->id)
                ->update([
                    'quantity' => $row->quantity,
                    'unit' => $row->unit,
                    'multiplier' => 1,
                ]);
        }

        Schema::table('product_quantity_prices', function (Blueprint $table) {
            $table->dropForeign(['quantity_price_tier_id']);
            $table->dropColumn('quantity_price_tier_id');
            $table->dropIndex('product_quantity_prices_product_id_idx');
        });

        Schema::table('product_quantity_prices', function (Blueprint $table) {
            $table->unique(['product_id', 'quantity', 'multiplier', 'unit'], 'product_quantity_price_unique');
        });

        Schema::dropIfExists('quantity_price_tiers');
    }
};
