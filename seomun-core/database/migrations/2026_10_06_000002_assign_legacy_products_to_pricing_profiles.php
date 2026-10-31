<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $mapping = [
                'LEGACY_COMMON_TYPE_A' => [
                    'categories' => ['business-card'],
                    'structure' => 'single',
                ],
                'LEGACY_BOOK_COVER_INNER' => [
                    'categories' => ['book'],
                    'structure' => 'cover_inner',
                ],
                'LEGACY_HOT_DEAL_BOOK_COVER_INNER' => [
                    'categories' => ['hot-deal-booklet'],
                    'structure' => 'cover_inner',
                ],
                'LEGACY_OTHER_REVIEW' => [
                    'categories' => [
                        'design',
                        'goods',
                        'hanging-banner',
                        'promotional-materials',
                    ],
                    'structure' => 'single',
                ],
            ];

            foreach ($mapping as $profileCode => $config) {
                $profileId = DB::table('pricing_profiles')
                    ->where('code', $profileCode)
                    ->value('id');

                if (! $profileId && $profileCode === 'LEGACY_OTHER_REVIEW') {
                    $profileId = DB::table('pricing_profiles')->insertGetId([
                        'code' => 'LEGACY_OTHER_REVIEW',
                        'name' => 'Legacy Other — Requires Pricing Review',
                        'calculator_type' => 'unit_tier',
                        'settings' => json_encode([
                            'migration_state' => 'requires_calculator_selection',
                            'legacy_rule' => ['categories' => ['OTHER']],
                        ], JSON_THROW_ON_ERROR),
                        'is_active' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                if (! $profileId) {
                    throw new RuntimeException("Pricing profile {$profileCode} is missing.");
                }

                // The current catalog uses the generic `design` category for
                // legacy products whose slugs still identify their print type.
                // Bind those products before the broad category fallback below.
                $slugGroups = [
                    'LEGACY_BOOK_COVER_INNER' => [
                        'design-wireless-book',
                        'design-hardcover-booklet',
                        'design-saddle-stitched-booklet',
                        'design-ring-booklet',
                    ],
                    'LEGACY_COMMON_TYPE_B' => [
                        'design-postcard',
                        'design-ticket',
                    ],
                    'LEGACY_COMMON_TYPE_C' => [
                        'design-leaflet',
                        'design-flyer',
                    ],
                ];
                if (isset($slugGroups[$profileCode])) {
                    DB::table('products')
                        ->whereNull('pricing_profile_id')
                        ->whereNull('deleted_at')
                        ->whereIn('slug', $slugGroups[$profileCode])
                        ->update([
                            'pricing_profile_id' => $profileId,
                            'pricing_structure' => $config['structure'],
                            'updated_at' => now(),
                        ]);
                }

                DB::table('products')
                    ->whereNull('pricing_profile_id')
                    ->whereNull('deleted_at')
                    ->whereIn('category_id', function ($query) use ($config): void {
                        $query->select('id')
                            ->from('categories')
                            ->whereIn('code', $config['categories'])
                            ->orWhereIn('slug', $config['categories']);
                    })
                    ->update([
                        'pricing_profile_id' => $profileId,
                        'pricing_structure' => $config['structure'],
                        'updated_at' => now(),
                    ]);
            }
        });
    }

    public function down(): void
    {
        // Keep product-to-profile assignments intact when rolling back code deployments.
    }
};
