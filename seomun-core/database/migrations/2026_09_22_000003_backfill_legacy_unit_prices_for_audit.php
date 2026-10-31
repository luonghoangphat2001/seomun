<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pricing_migration_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['mapped', 'pending'])->default('pending');
            $table->text('message')->nullable();
            $table->json('legacy_snapshot')->nullable();
            $table->timestamps();
            $table->unique('product_id');
        });

        $profileId = DB::table('pricing_profiles')->where('code', 'LEGACY_UNIT_TIER')->value('id');
        if (! $profileId) {
            $profileId = DB::table('pricing_profiles')->insertGetId([
                'code' => 'LEGACY_UNIT_TIER',
                'name' => 'Legacy Unit Tier (migration)',
                'calculator_type' => 'unit_tier',
                'settings' => json_encode([]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('products')->orderBy('id')->chunkById(200, function ($products) use ($profileId) {
            foreach ($products as $product) {
                $unitPriceIds = DB::table('unit_prices')->where('product_id', $product->id)->where('is_active', true)->pluck('id');
                $status = $unitPriceIds->isNotEmpty() ? 'mapped' : 'pending';
                $message = $status === 'mapped'
                    ? 'Legacy product-specific Unit Price rules are retained and linked to the migration Pricing Profile.'
                    : 'No legacy Unit Price was found. Select a Pricing Profile and configure Unit Price Settings before this product can quote.';
                DB::table('pricing_migration_audits')->insert([
                    'product_id' => $product->id,
                    'status' => $status,
                    'message' => $message,
                    'legacy_snapshot' => json_encode(['product_price' => $product->price, 'unit_price_ids' => $unitPriceIds->values()]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                if ($status !== 'mapped') { continue; }

                DB::table('products')->where('id', $product->id)->update([
                    'pricing_profile_id' => $profileId,
                    'pricing_structure' => 'single',
                    'updated_at' => now(),
                ]);
            }
        });
    }

    public function down(): void
    {
        // Profile/list rows are intentionally retained on rollback because they
        // may have been edited after migration. Only the audit trail is removed.
        Schema::dropIfExists('pricing_migration_audits');
    }
};
