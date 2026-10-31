<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $product = DB::table('products')
                ->where('id', 31)
                ->where('slug', 'postcard')
                ->whereNull('deleted_at')
                ->first();

            if (! $product) {
                throw new RuntimeException('Expected Postcard product ID 31 was not found.');
            }

            $profile = DB::table('pricing_profiles')
                ->where('code', 'LEGACY_COMMON_TYPE_B')
                ->where('is_active', true)
                ->first();

            if (! $profile) {
                throw new RuntimeException('An active LEGACY_COMMON_TYPE_B pricing profile is required.');
            }

            $paperGroup = DB::table('product_option_groups')
                ->where('product_id', 31)
                ->where('code', 'paper')
                ->first();

            if (! $paperGroup) {
                throw new RuntimeException('Postcard product ID 31 has no paper option group.');
            }

            $paperIds = DB::table('product_options')
                ->join('erp_options', 'erp_options.id', '=', 'product_options.erp_option_id')
                ->where('product_options.option_group_id', $paperGroup->id)
                ->where('product_options.is_active', true)
                ->whereNull('product_options.deleted_at')
                ->whereNotNull('erp_options.paper_id')
                ->distinct()
                ->pluck('erp_options.paper_id');

            if ($paperIds->isEmpty()) {
                throw new RuntimeException('Postcard product ID 31 has no selectable ERP papers.');
            }

            $missingPaperIds = $paperIds->filter(fn ($paperId): bool => ! DB::table('paper_prices')
                ->where('paper_id', $paperId)
                ->where('paper_size_division_code', 'NATIONAL_4')
                ->where('is_hot_deal', false)
                ->whereNull('deleted_at')
                ->exists())->values()->all();

            if ($missingPaperIds !== []) {
                throw new RuntimeException(
                    'Cannot bind Postcard pricing: NATIONAL_4 paper rates are missing for paper IDs '
                    .implode(', ', $missingPaperIds)
                    .'.'
                );
            }

            $printingPrices = [];
            foreach (['SINGLE', 'DOUBLE'] as $sideType) {
                $printingPrice = DB::table('printing_prices')
                    ->where('machine_type', 'P1350')
                    ->where('book_printing_size_type', 'TYPE_B')
                    ->where('paper_size_division_code', 'NATIONAL_4')
                    ->where('side_type', $sideType)
                    ->whereNull('book_printing_type')
                    ->where('is_hot_deal', false)
                    ->whereNull('deleted_at')
                    ->orderBy('id')
                    ->first();

                if (! $printingPrice || ! DB::table('printing_price_items')
                    ->where('printing_price_id', $printingPrice->id)
                    ->exists()) {
                    throw new RuntimeException("P1350 TYPE_B {$sideType} printing rates are missing.");
                }

                $printingPrices[$sideType] = $printingPrice;
            }

            $settings = json_decode((string) $profile->settings, true) ?: [];
            $legacyRule = $settings['legacy_rule'] ?? [];
            $legacyRule['categories'] = array_values(array_unique(array_merge(
                $legacyRule['categories'] ?? [],
                ['POSTCARD'],
            )));
            $settings['legacy_rule'] = $legacyRule;
            $settings['migration_state'] = 'ready';
            $settings['sections']['single'] = array_merge($settings['sections']['single'] ?? [], [
                'paper_option_group' => 'paper',
                'side_option_group' => 'printed_side',
                'printing_price_id' => (int) $printingPrices['SINGLE']->id,
            ]);

            DB::table('pricing_profiles')->where('id', $profile->id)->update([
                'settings' => json_encode($settings, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);

            DB::table('products')->where('id', 31)->update([
                'pricing_profile_id' => $profile->id,
                'pricing_structure' => 'single',
                'updated_at' => now(),
            ]);
        });
    }

    public function down(): void
    {
        // Preserve pricing profile assignments and validated production data on rollback.
    }
};
