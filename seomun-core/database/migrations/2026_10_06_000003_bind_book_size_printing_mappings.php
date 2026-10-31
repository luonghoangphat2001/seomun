<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $printingId = static function (string $sizeType, string $printingType, bool $hotDeal): int {
                $row = DB::table('printing_prices')
                    ->where('machine_type', 'P1350')
                    ->where('book_printing_size_type', $sizeType)
                    ->where('book_printing_type', $printingType)
                    ->where('is_hot_deal', $hotDeal)
                    ->whereNull('deleted_at')
                    ->orderBy('id')
                    ->first();
                if (! $row) {
                    throw new RuntimeException("Missing P1350 {$sizeType}/{$printingType} printing price (hot={$hotDeal})");
                }

                $division = match ($sizeType) {
                    'nation_4' => 'NATIONAL_4',
                    'nation_8' => 'NATIONAL_8',
                    'nation_16' => 'NATIONAL_16',
                };
                DB::table('printing_prices')->where('id', $row->id)->update([
                    'paper_size_division_code' => $division,
                    'updated_at' => now(),
                ]);

                return (int) $row->id;
            };

            $standard = [
                'cover_a4_b5' => $printingId('nation_4', 'BOOKLET_COVER', false),
                'cover_a5' => $printingId('nation_8', 'BOOKLET_COVER', false),
                'inner_a4_b5' => $printingId('nation_8', 'BOOKLET_INNER', false),
                'inner_a5' => $printingId('nation_16', 'BOOKLET_INNER', false),
            ];
            $hot = [
                'cover_a4_b5' => $printingId('nation_4', 'BOOKLET_COVER', true),
                'cover_a5' => $printingId('nation_8', 'BOOKLET_COVER', true),
                'inner_a4_b5' => $printingId('nation_8', 'BOOKLET_INNER', true),
                'inner_a5' => $printingId('nation_16', 'BOOKLET_INNER', true),
            ];

            $mappings = [
                'LEGACY_BOOK_COVER_INNER' => [
                    'cover' => [
                        'paper_option_group' => 'cover_paper',
                        'side_option_group' => 'printed_cover_side',
                        'page_count_field' => 'cover_page_count',
                        'size_mappings' => [
                            'A4' => ['printing_price_id' => $standard['cover_a4_b5']],
                            'B5' => ['printing_price_id' => $standard['cover_a4_b5']],
                            'A5' => ['printing_price_id' => $standard['cover_a5']],
                        ],
                    ],
                    'inner' => [
                        'paper_option_group' => 'inner_paper',
                        'side_option_group' => 'printed_inner_side',
                        'page_count_field' => 'inner_page_count',
                        'size_mappings' => [
                            'A4' => ['printing_price_id' => $standard['inner_a4_b5']],
                            'B5' => ['printing_price_id' => $standard['inner_a4_b5']],
                            'A5' => ['printing_price_id' => $standard['inner_a5']],
                        ],
                    ],
                ],
                'LEGACY_HOT_DEAL_BOOK_COVER_INNER' => [
                    'cover' => [
                        'paper_option_group' => 'cover_paper',
                        'side_option_group' => 'printed_cover_side',
                        'page_count_field' => 'cover_page_count',
                        'size_mappings' => [
                            'A4' => ['printing_price_id' => $hot['cover_a4_b5']],
                            'B5' => ['printing_price_id' => $hot['cover_a4_b5']],
                            'A5' => ['printing_price_id' => $hot['cover_a5']],
                        ],
                    ],
                    'inner' => [
                        'paper_option_group' => 'inner_paper',
                        'side_option_group' => 'printed_inner_side',
                        'page_count_field' => 'inner_page_count',
                        'size_mappings' => [
                            'A4' => ['printing_price_id' => $hot['inner_a4_b5']],
                            'B5' => ['printing_price_id' => $hot['inner_a4_b5']],
                            'A5' => ['printing_price_id' => $hot['inner_a5']],
                        ],
                    ],
                ],
            ];

            foreach ($mappings as $profileCode => $sections) {
                $profile = DB::table('pricing_profiles')->where('code', $profileCode)->first();
                if (! $profile) {
                    continue;
                }
                $settings = json_decode((string) $profile->settings, true) ?: [];
                $settings['sections'] = $sections;
                DB::table('pricing_profiles')->where('id', $profile->id)->update([
                    'settings' => json_encode($settings, JSON_THROW_ON_ERROR),
                    'is_active' => true,
                    'updated_at' => now(),
                ]);
            }
        });
    }

    public function down(): void
    {
        // Keep production pricing mappings intact when rolling back code deployments.
    }
};
