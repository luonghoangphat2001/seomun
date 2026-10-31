<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seeds the legacy rule catalogue before Products are assigned to profiles.
 *
 * These records are intentionally inactive: existing hard-coded rules can be
 * catalogued without changing a live Product's quote source. A later data
 * backfill activates and assigns only profiles whose production rates pass
 * coverage validation.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $profiles = [
            [
                'code' => 'LEGACY_COMMON_TYPE_A',
                'name' => 'Legacy Common Print — Type A',
                'calculator_type' => 'paper_print',
                'settings' => [
                    'migration_state' => 'requires_rate_binding',
                    'legacy_rule' => [
                        'categories' => ['BUSINESS_CARD'],
                        'machine_type' => 'P1350',
                        'book_printing_size_type' => 'TYPE_A',
                        'paper_size_division_code' => 'NATIONAL_4',
                        'side_source' => 'printed_side',
                    ],
                    'supported_structures' => ['single'],
                    'required_option_group_codes' => ['size', 'paper', 'printed_side'],
                ],
            ],
            [
                'code' => 'LEGACY_COMMON_TYPE_B',
                'name' => 'Legacy Common Print — Type B',
                'calculator_type' => 'paper_print',
                'settings' => [
                    'migration_state' => 'requires_rate_binding',
                    'legacy_rule' => [
                        'categories' => ['POSTCARD', 'TICKET'],
                        'machine_type' => 'P1350',
                        'book_printing_size_type' => 'TYPE_B',
                        'paper_size_division_code' => 'NATIONAL_4',
                        'side_source' => 'printed_side',
                    ],
                    'supported_structures' => ['single'],
                    'required_option_group_codes' => ['size', 'paper', 'printed_side'],
                ],
            ],
            [
                'code' => 'LEGACY_COMMON_TYPE_C',
                'name' => 'Legacy Common Print — Type C',
                'calculator_type' => 'paper_print',
                'settings' => [
                    'migration_state' => 'requires_rate_binding',
                    'legacy_rule' => [
                        'categories' => ['LEAFLET', 'FLYER', 'POSTER'],
                        'machine_type' => 'P1350',
                        'book_printing_size_type' => 'TYPE_C',
                        'paper_size_division_code' => 'NATIONAL_4',
                        'side_source' => 'printed_side',
                    ],
                    'supported_structures' => ['single'],
                    'required_option_group_codes' => ['size', 'paper', 'printed_side'],
                ],
            ],
            [
                'code' => 'LEGACY_BOOK_COVER_INNER',
                'name' => 'Legacy Book — Cover & Inner',
                'calculator_type' => 'paper_print',
                'settings' => [
                    'migration_state' => 'requires_rate_binding',
                    'legacy_rule' => [
                        'categories' => ['BOOK', 'WIRELESS_BOOKLET', 'SADDLE_STITCHED_BOOKLET', 'TWIN_RING_BOOKLET', 'COILING_BOOKLET'],
                        'structure' => 'cover_inner',
                        'cover_printing_type' => 'BOOKLET_COVER',
                        'inner_printing_type' => 'BOOKLET_INNER',
                    ],
                    'supported_structures' => ['cover_inner'],
                    'required_option_group_codes' => ['size', 'cover_paper', 'inner_paper', 'printed_cover_side', 'printed_inner_side'],
                ],
            ],
            [
                'code' => 'LEGACY_HOT_DEAL_BOOK_COVER_INNER',
                'name' => 'Legacy Hot Deal Book — Cover & Inner',
                'calculator_type' => 'paper_print',
                'settings' => [
                    'migration_state' => 'requires_rate_binding',
                    'legacy_rule' => [
                        'categories' => ['HOT_DEAL_BOOKLET', 'HOT_DEAL_WIRELESS_BOOKLET', 'HOT_DEAL_SADDLE_STITCHED_BOOKLET', 'HOT_DEAL_TWIN_RING_BOOKLET', 'HOT_DEAL_COILING_BOOKLET'],
                        'structure' => 'cover_inner',
                        'is_hot_deal' => true,
                        'cover_printing_type' => 'BOOKLET_COVER',
                        'inner_printing_type' => 'BOOKLET_INNER',
                    ],
                    'supported_structures' => ['cover_inner'],
                    'required_option_group_codes' => ['size', 'cover_paper', 'inner_paper', 'printed_cover_side', 'printed_inner_side'],
                ],
            ],
            [
                'code' => 'LEGACY_OTHER_REVIEW',
                'name' => 'Legacy Other — Requires Pricing Review',
                // The database requires a supported calculator enum. This is a
                // placeholder only; is_active=false prevents it from quoting
                // until Admin chooses the real calculator and rate settings.
                'calculator_type' => 'unit_tier',
                'settings' => [
                    'migration_state' => 'requires_calculator_selection',
                    'legacy_rule' => [
                        'categories' => ['OTHER'],
                    ],
                    'migration_note' => 'Select paper_print, unit_tier, area_unit, or matrix before activation.',
                ],
            ],
        ];

        foreach ($profiles as $profile) {
            if (DB::table('pricing_profiles')->where('code', $profile['code'])->exists()) {
                continue;
            }
            DB::table('pricing_profiles')->insert([
                ...$profile,
                'settings' => json_encode($profile['settings'], JSON_THROW_ON_ERROR),
                'is_active' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        // Do not delete seeded profiles. An administrator may have completed
        // their rates/settings after this migration ran.
    }
};
