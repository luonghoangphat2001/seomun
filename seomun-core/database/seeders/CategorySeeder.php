<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->truncateCategories();

        $parents = $this->getParentCategories();
        $childrenByParentSlug = $this->getChildrenByParentSlug();

        $createdParents = 0;
        $createdChildren = 0;

        foreach ($parents as $data) {
            $slug = $data['slug'];
            $childrenData = $childrenByParentSlug[$slug] ?? [];

            $parent = Category::query()->create($data);
            $createdParents++;

            foreach ($childrenData as $childData) {
                $childData['parent_id'] = $parent->id;
                Category::query()->create($childData);
                $createdChildren++;
            }
        }

        $this->command->info("Categories seeded: {$createdParents} parents, {$createdChildren} children.");
    }

    protected function truncateCategories(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('categories')->truncate();
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Parent categories: business + product-type (tpa001, tpa013, tpa023).
     *
     * @return array<int, array<string, mixed>>
     */
    protected function getParentCategories(): array
    {
        return [
            [
                'name' => '책자',
                'name_en' => 'Book',
                'slug' => 'book',
                'code' => 'book',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => '핫딜책자',
                'name_en' => 'Hot Deal Booklet',
                'slug' => 'hot-deal-booklet',
                'code' => 'hot-deal-booklet',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => '명함',
                'name_en' => 'Business Card',
                'slug' => 'business-card',
                'code' => 'business-card',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => '스티커',
                'name_en' => 'Sticker',
                'slug' => 'sticker',
                'code' => 'sticker',
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => '홍보물',
                'name_en' => 'Promotional Materials',
                'slug' => 'promotional-materials',
                'code' => 'promotional-materials',
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'name' => '굿즈',
                'name_en' => 'Goods',
                'slug' => 'goods',
                'code' => 'goods',
                'sort_order' => 6,
                'is_active' => true,
            ],
            [
                'name' => '봉투',
                'name_en' => 'Envelope',
                'slug' => 'envelope',
                'code' => 'envelope',
                'sort_order' => 7,
                'is_active' => true,
            ],
            [
                'name' => '현수막',
                'name_en' => 'Hanging Banner',
                'slug' => 'hanging-banner',
                'code' => 'hanging-banner',
                'sort_order' => 8,
                'is_active' => true,
            ],
            [
                'name' => '배너',
                'name_en' => 'Banner',
                'slug' => 'banner',
                'code' => 'banner',
                'sort_order' => 9,
                'is_active' => true,
            ],
            [
                'name' => '낱장출력',
                'name_en' => 'Single Page Printing',
                'slug' => 'single-page-printing',
                'code' => 'single-page-printing',
                'sort_order' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'POP/보드지',
                'name_en' => 'POP/Cardboard',
                'slug' => 'pop-cardboard',
                'code' => 'pop-cardboard',
                'sort_order' => 11,
                'is_active' => true,
            ],
            [
                'name' => '디자인',
                'name_en' => 'Design',
                'slug' => 'design',
                'code' => 'design',
                'sort_order' => 12,
                'is_active' => true,
            ],
        ];
    }

    /**
     * Children by parent slug. Only business categories have children.
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    protected function getChildrenByParentSlug(): array
    {
        return [];
    }
}
