<?php

namespace App\Console\Commands;

use App\Enums\CategoryEnum;
use App\Models\PricingProfile;
use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/** Classifies legacy Products against the seeded Pricing Profile catalogue. */
class BackfillLegacyPricingProfiles extends Command
{
    protected $signature = 'pricing:backfill-legacy-profiles
                            {--apply : Persist the proposed Profile mapping to pricing_migration_audits}
                            {--assign : Assign the catalogued Profile to each legacy Product (also writes the audit)}
                            {--product=* : Restrict the run to one or more Product IDs}';

    protected $description = 'Classify legacy Products against seeded Pricing Profiles; dry-run by default';

    public function handle(): int
    {
        $assign = (bool) $this->option('assign');
        $apply = (bool) $this->option('apply') || $assign;
        $ids = array_values(array_filter(array_map('intval', (array) $this->option('product'))));
        $products = Product::query()
            ->with('category')
            ->when($ids !== [], fn ($query) => $query->whereIn('id', $ids))
            ->orderBy('id')
            ->get();
        $codes = $this->profileCodes();
        $catalogue = PricingProfile::query()
            ->whereIn('code', array_values($codes))
            ->get()
            ->keyBy('code');
        $rows = [];
        $classified = 0;
        $other = 0;

        foreach ($products as $product) {
            $category = $this->legacyCategory($product);
            $profileCode = $this->profileCodeFor($category);
            /** @var PricingProfile|null $profile */
            $profile = $catalogue->get($profileCode);
            $profileId = $profile?->id;
            $isOther = $profileCode === $codes['other'];
            $message = $isOther
                ? 'Classified as Other; Admin must choose calculator and bind rates before activation.'
                : "Classified as {$profileCode}; bind rates and pass coverage before activation.";
            $snapshot = [
                'legacy_category' => $category?->value,
                'category_id' => $product->category_id,
                'category_code' => $product->category?->code,
                'category_slug' => $product->category?->slug,
                'category_name' => $product->category?->name,
                'suggested_pricing_profile_code' => $profileCode,
                'suggested_pricing_profile_id' => $profileId,
                'product_price' => $product->price,
            ];

            $status = 'pending';
            if (! $profile) {
                $message = "Seeded catalog Profile {$profileCode} was not found. Run php artisan migrate first.";
            } elseif ($assign) {
                DB::transaction(function () use ($product, $profile): void {
                    $product->update([
                        'pricing_profile_id' => $profile->id,
                        'pricing_structure' => $this->pricingStructureFor($profile->code),
                    ]);
                });
                $status = 'mapped';
                $message = $isOther
                    ? "Assigned {$profile->code} for Admin review. Choose its real calculator and bind rates before activation."
                    : "Assigned {$profile->code}. Bind rates and activate the Profile before it can quote.";
            }

            if ($apply) {
                DB::table('pricing_migration_audits')->updateOrInsert(
                    ['product_id' => $product->id],
                    [
                        'status' => $status,
                        'message' => $message,
                        'legacy_snapshot' => json_encode($snapshot, JSON_THROW_ON_ERROR),
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );
            }

            $rows[] = [$product->id, $profileCode, $profileId ?? '-', $status, $message];
            $isOther ? $other++ : $classified++;
        }

        $this->table(['Product ID', 'Profile code', 'Profile ID', 'Status', 'Result'], $rows);
        $this->newLine();
        $this->info("Classified: {$classified}; other: {$other}.");
        if (! $apply) {
            $this->warn('Dry-run only. Run again with --apply to save the proposed Profile mapping in pricing_migration_audits.');
        }
        if (! $assign) {
            $this->warn('No Product was assigned. Run again with --apply --assign to persist the category-to-Profile catalogue mapping.');
        } else {
            $this->warn('Assignment only establishes the Product-to-Profile relation. Inactive or incomplete Profiles remain unavailable to the quote engine until rate binding and activation.');
        }

        return self::SUCCESS;
    }

    /** @return array<string, string> */
    private function profileCodes(): array
    {
        return [
            'type_a' => 'LEGACY_COMMON_TYPE_A',
            'type_b' => 'LEGACY_COMMON_TYPE_B',
            'type_c' => 'LEGACY_COMMON_TYPE_C',
            'book' => 'LEGACY_BOOK_COVER_INNER',
            'hot_deal_book' => 'LEGACY_HOT_DEAL_BOOK_COVER_INNER',
            'other' => 'LEGACY_OTHER_REVIEW',
        ];
    }

    private function profileCodeFor(?CategoryEnum $category): string
    {
        $codes = $this->profileCodes();

        return match ($category) {
            CategoryEnum::BUSINESS_CARD => $codes['type_a'],
            CategoryEnum::POSTCARD, CategoryEnum::TICKET => $codes['type_b'],
            CategoryEnum::LEAFLET, CategoryEnum::FLYER, CategoryEnum::POSTER => $codes['type_c'],
            CategoryEnum::BOOK,
            CategoryEnum::WIRELESS_BOOKLET,
            CategoryEnum::SADDLE_STITCHED_BOOKLET,
            CategoryEnum::TWIN_RING_BOOKLET,
            CategoryEnum::COILING_BOOKLET => $codes['book'],
            CategoryEnum::HOT_DEAL_BOOKLET,
            CategoryEnum::HOT_DEAL_WIRELESS_BOOKLET,
            CategoryEnum::HOT_DEAL_SADDLE_STITCHED_BOOKLET,
            CategoryEnum::HOT_DEAL_TWIN_RING_BOOKLET,
            CategoryEnum::HOT_DEAL_COILING_BOOKLET => $codes['hot_deal_book'],
            default => $codes['other'],
        };
    }

    private function legacyCategory(Product $product): ?CategoryEnum
    {
        $category = $product->category;
        if (! $category) {
            return null;
        }

        $slugCode = strtoupper(str_replace('-', '_', (string) $category->slug));

        return CategoryEnum::tryFrom((string) $category->code)
            ?? CategoryEnum::tryFrom((string) $category->slug)
            ?? CategoryEnum::tryFrom($slugCode)
            ?? CategoryEnum::fromLabel($category->name)
            ?? CategoryEnum::fromProductLabel($category->name);
    }

    private function pricingStructureFor(string $profileCode): string
    {
        return in_array($profileCode, [
            'LEGACY_BOOK_COVER_INNER',
            'LEGACY_HOT_DEAL_BOOK_COVER_INNER',
        ], true) ? 'cover_inner' : 'single';
    }
}
