<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $product = DB::table('products')
                ->where('id', 32)
                ->where('slug', 'ticket')
                ->whereNull('deleted_at')
                ->first();

            if (! $product) {
                throw new RuntimeException('Expected Ticket product ID 32 was not found.');
            }

            $profile = DB::table('pricing_profiles')
                ->where('code', 'LEGACY_COMMON_TYPE_B')
                ->first();

            if (! $profile) {
                throw new RuntimeException('LEGACY_COMMON_TYPE_B pricing profile is missing.');
            }

            $singleSidedRate = DB::table('printing_prices')
                ->where('machine_type', 'P1350')
                ->where('book_printing_size_type', 'TYPE_B')
                ->where('side_type', 'SINGLE')
                ->whereNull('book_printing_type')
                ->where('is_hot_deal', false)
                ->whereNull('deleted_at')
                ->orderBy('id')
                ->first();

            if (! $singleSidedRate) {
                throw new RuntimeException('P1350 TYPE_B SINGLE printing price is missing.');
            }

            $paperGroup = DB::table('product_option_groups')
                ->where('product_id', 32)
                ->where('code', 'paper')
                ->first();

            if (! $paperGroup) {
                throw new RuntimeException('Ticket product ID 32 has no paper option group.');
            }

            // User-approved placeholder rates for the three missing Ticket papers.
            // Keep the unique paper/size row and revive it if it was soft-deleted.
            foreach ([9, 13, 52] as $paperId) {
                if (! DB::table('papers')->where('id', $paperId)->exists()) {
                    throw new RuntimeException("Ticket paper ID {$paperId} does not exist.");
                }

                $paperPrice = DB::table('paper_prices')
                    ->where('paper_id', $paperId)
                    ->where('paper_size_division_code', 'NATIONAL_4')
                    ->first();

                $values = [
                    'supply_price' => 1,
                    'cost' => 1,
                    'is_hot_deal' => false,
                    'deleted_at' => null,
                    'updated_at' => now(),
                ];

                if ($paperPrice) {
                    DB::table('paper_prices')->where('id', $paperPrice->id)->update($values);
                } else {
                    DB::table('paper_prices')->insert($values + [
                        'paper_id' => $paperId,
                        'paper_size_division_code' => 'NATIONAL_4',
                        'created_at' => now(),
                    ]);
                }
            }

            $paperIds = DB::table('product_options as product_options')
                ->join('erp_options', 'erp_options.id', '=', 'product_options.erp_option_id')
                ->where('product_options.option_group_id', $paperGroup->id)
                ->where('product_options.is_active', true)
                ->whereNull('product_options.deleted_at')
                ->whereNotNull('erp_options.paper_id')
                ->distinct()
                ->pluck('erp_options.paper_id');

            $missingPaperIds = $paperIds->filter(function ($paperId): bool {
                return ! DB::table('paper_prices')
                    ->where('paper_id', $paperId)
                    ->where('paper_size_division_code', 'NATIONAL_4')
                    ->where('is_hot_deal', false)
                    ->whereNull('deleted_at')
                    ->exists();
            })->values()->all();

            if ($missingPaperIds !== []) {
                throw new RuntimeException(
                    'Cannot activate Ticket pricing: NATIONAL_4 paper rates are missing for paper IDs '
                    . implode(', ', $missingPaperIds)
                    . '.'
                );
            }

            DB::table('printing_prices')
                ->where('machine_type', 'P1350')
                ->where('book_printing_size_type', 'TYPE_B')
                ->whereNull('book_printing_type')
                ->where('is_hot_deal', false)
                ->whereNull('deleted_at')
                ->whereNull('paper_size_division_code')
                ->update([
                    'paper_size_division_code' => 'NATIONAL_4',
                    'updated_at' => now(),
                ]);

            $settings = json_decode((string) $profile->settings, true) ?: [];
            $settings['migration_state'] = 'ready';
            $settings['legacy_rule'] = array_merge($settings['legacy_rule'] ?? [], [
                'categories' => ['TICKET'],
                'machine_type' => 'P1350',
                'book_printing_size_type' => 'TYPE_B',
                'paper_size_division_code' => 'NATIONAL_4',
                'side_source' => 'printed_side',
            ]);
            $settings['sections']['single'] = array_merge($settings['sections']['single'] ?? [], [
                'paper_option_group' => 'paper',
                'side_option_group' => 'printed_side',
                'printing_price_id' => (int) $singleSidedRate->id,
            ]);

            DB::table('pricing_profiles')->where('id', $profile->id)->update([
                'settings' => json_encode($settings, JSON_THROW_ON_ERROR),
                'is_active' => true,
                'updated_at' => now(),
            ]);

            DB::table('products')->where('id', 32)->update([
                'pricing_profile_id' => $profile->id,
                'pricing_structure' => 'single',
                'updated_at' => now(),
            ]);
        });
    }

    public function down(): void
    {
        // Preserve activated production pricing data on rollback.
    }
};
