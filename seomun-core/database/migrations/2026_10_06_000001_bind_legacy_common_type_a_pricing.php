<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            // Type A business-card printing rates use the NATIONAL_4 sheet.
            DB::table('printing_prices')
                ->where('machine_type', 'P1350')
                ->where('book_printing_size_type', 'TYPE_A')
                ->where('is_hot_deal', false)
                ->whereNull('paper_size_division_code')
                ->update([
                    'paper_size_division_code' => 'NATIONAL_4',
                    'updated_at' => now(),
                ]);

            $printingPrice = DB::table('printing_prices')
                ->where('machine_type', 'P1350')
                ->where('book_printing_size_type', 'TYPE_A')
                ->where('paper_size_division_code', 'NATIONAL_4')
                ->where('side_type', 'SINGLE')
                ->where('is_hot_deal', false)
                ->orderBy('id')
                ->first();

            if (! $printingPrice) {
                throw new RuntimeException('TYPE_A SINGLE NATIONAL_4 printing price is missing.');
            }

            $profile = DB::table('pricing_profiles')
                ->where('code', 'LEGACY_COMMON_TYPE_A')
                ->first();

            if (! $profile) {
                throw new RuntimeException('LEGACY_COMMON_TYPE_A pricing profile is missing.');
            }

            $settings = json_decode((string) $profile->settings, true) ?: [];
            $settings['sections']['single'] = array_merge(
                $settings['sections']['single'] ?? [],
                [
                    'paper_option_group' => 'paper',
                    'side_option_group' => 'printed_side',
                    'printing_price_id' => $printingPrice->id,
                ],
            );

            DB::table('pricing_profiles')->where('id', $profile->id)->update([
                'settings' => json_encode($settings, JSON_THROW_ON_ERROR),
                'is_active' => true,
                'updated_at' => now(),
            ]);

            // Product 22 is the legacy Business Card product used by this profile.
            DB::table('products')->where('id', 22)->update([
                'pricing_profile_id' => $profile->id,
                'pricing_structure' => 'single',
                'updated_at' => now(),
            ]);
        });
    }

    public function down(): void
    {
        // Keep production pricing data intact when rolling back code deployments.
    }
};
