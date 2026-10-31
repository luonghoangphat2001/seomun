<?php

namespace Database\Seeders;

use App\Enums\UserGuideStatus;
use App\Models\Product;
use App\Models\UserGuide;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserGuideProductSeeder extends Seeder
{
    /**
     * Seed user guides (이용안내) and link them to existing products.
     * GET /api/products/{slug}/user-guides will return these.
     */
    public function run(): void
    {
        $products = Product::orderBy('id')->take(6)->get();
        if ($products->isEmpty()) {
            $this->command->warn('No products found. Run CategorySeeder and ProductSeeder first.');

            return;
        }

        $guides = [
            [
                'button_name' => '이용안내',
                'attached_file' => 'user-guides/usage-guide-1.pdf',
            ],
            [
                'button_name' => '이용안내',
                'attached_file' => 'user-guides/usage-guide-2.pdf',
            ],
            [
                'button_name' => '인쇄 가이드',
                'attached_file' => 'user-guides/print-guide.pdf',
            ],
            [
                'button_name' => '이용안내',
                'attached_file' => 'user-guides/guide-namecard.pdf',
            ],
        ];

        foreach ($guides as $index => $data) {
            $guide = UserGuide::firstOrCreate(
                ['attached_file' => $data['attached_file']],
                [
                    'status' => UserGuideStatus::ACTIVE,
                    'button_name' => $data['button_name'],
                ]
            );

            // Attach to 1–2 products so each of the first products has at least one guide
            $productIds = $products->slice($index % $products->count(), 2)->pluck('id')->toArray();
            $guide->products()->syncWithoutDetaching($productIds);
        }

        $totalGuides = UserGuide::count();
        $linked = DB::table('user_guide_product')->count();
        $this->command->info("UserGuideProductSeeder: {$totalGuides} user guide(s), {$linked} product link(s).");
    }
}
