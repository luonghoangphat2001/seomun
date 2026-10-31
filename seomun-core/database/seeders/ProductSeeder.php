<?php

namespace Database\Seeders;

use App\Enums\ErpOptionGroupCode;
use App\Models\Category;
use App\Models\ErpOptionGroup;
use App\Models\Product;
use App\Services\Admin\AdminProductService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // $this->truncateProductTables();

        $adminProductService = app(AdminProductService::class);

        $products = $this->getProducts();

        foreach ($products as $item) {
            $category = Category::where('slug', $item['category'])->first();

            if (! $category) {
                $this->command->warn("Category {$item['category']} not found.");

                continue;
            }

            if (Product::where('slug', $item['slug'])->exists()) {
                $this->command->info("Product {$item['slug']} already exists. Skipped.");
                continue;
            }

            $adminProductService->createProduct([
                'category_id' => $category->id,
                'name' => $item['name'],
                'name_en' => $item['name_en'] ?? $item['name'],
                'slug' => $item['slug'],
                'short_description' => $item['name'],
                'description' => "{$item['name']} product",
                'price' => 15000,
                'compare_price' => 20000,
                'sku' => $item['sku'],
                'images' => ["https://seomun-api.axndx.org/storage/products/images/1z81sYIC7YOnFg0MEbgxCTu47SHSy3gZFI2iFlFh.png"],
                'is_popular' => false,
                'is_featured' => false,
                'stock_quantity' => 100,
                'min_quantity' => 1,
                'max_quantity' => 10000,
                'sort_order' => $item['sort_order'],
                'is_active' => true,

                // TODO: map option group theo product type
                'option_groups' => [],

                'product_sets' => [
                    'quantity' => 100,
                    'set_type' => 'select',
                    'min_set' => 1,
                    'max_set' => 100,
                    'step_set' => 1,
                    'set_unit' => '건',
                ],

                "web_editor_id" => null,
                "allow_file_upload" => true,
                "allow_web_editor" => false,
                "is_blank_canvas" => true,
                "requires_separate_shipping" => false,
                "separate_shipping_fee" => 0,
                "quantity_prices" => [
                    [
                        "quantity" => 100,
                        "price" => 10000
                    ],
                    [
                        "quantity" => 200,
                        "price" => 20000
                    ]
                ]
            ]);
        }

        $this->command->info('Products seeded successfully.');
    }


    protected function getProducts(): array
    {
        return [

            // 책자
            [
                'category' => 'book',
                'name' => '무선제본',
                'name_en' => 'Wireless Binding',
                'slug' => 'wireless-binding',
                'sku' => 'BOOK-001',
                'sort_order' => 1,
            ],
            [
                'category' => 'book',
                'name' => '중철제본',
                'name_en' => 'Saddle Stitching',
                'slug' => 'saddle-stitching',
                'sku' => 'BOOK-002',
                'sort_order' => 2,
            ],
            [
                'category' => 'book',
                'name' => '양장제본',
                'name_en' => 'Hardcover Binding',
                'slug' => 'hardcover-binding',
                'sku' => 'BOOK-003',
                'sort_order' => 3,
            ],
            [
                'category' => 'book',
                'name' => '트윈링제본',
                'name_en' => 'Twin Ring Binding',
                'slug' => 'twin-ring-binding',
                'sku' => 'BOOK-004',
                'sort_order' => 4,
            ],
            [
                'category' => 'book',
                'name' => '코일링제본',
                'name_en' => 'Coil Binding',
                'slug' => 'coil-binding',
                'sku' => 'BOOK-005',
                'sort_order' => 5,
            ],


            // 핫딜책자
            [
                'category' => 'hot-deal-booklet',
                'name' => '무선제본',
                'name_en' => 'Wireless Binding',
                'slug' => 'hot-deal-wireless-binding',
                'sku' => 'HOTBOOK-001',
                'sort_order' => 1,
            ],
            [
                'category' => 'hot-deal-booklet',
                'name' => '중철제본',
                'name_en' => 'Saddle Stitching',
                'slug' => 'hot-deal-saddle-stitching',
                'sku' => 'HOTBOOK-002',
                'sort_order' => 2,
            ],
            [
                'category' => 'hot-deal-booklet',
                'name' => '양장제본',
                'name_en' => 'Hardcover Binding',
                'slug' => 'hot-deal-hardcover-binding',
                'sku' => 'HOTBOOK-003',
                'sort_order' => 3,
            ],
            [
                'category' => 'hot-deal-booklet',
                'name' => '트윈링제본',
                'name_en' => 'Twin Ring Binding',
                'slug' => 'hot-deal-twin-ring-binding',
                'sku' => 'HOTBOOK-004',
                'sort_order' => 4,
            ],
            [
                'category' => 'hot-deal-booklet',
                'name' => '코일링제본',
                'name_en' => 'Coil Binding',
                'slug' => 'hot-deal-coil-binding',
                'sku' => 'BHOTBOOKOOK-005',
                'sort_order' => 5,
            ],

            // 명함
            [
                'category' => 'business-card',
                'name' => '일반명함',
                'slug' => 'standard-business-card',
                'sku' => 'CARD-001',
                'sort_order' => 1,
            ],
            [
                'category' => 'business-card',
                'name' => '고급명함',
                'slug' => 'premium-business-card',
                'sku' => 'CARD-002',
                'sort_order' => 2,
            ],
            [
                'category' => 'business-card',
                'name' => '핫딜명함',
                'slug' => 'hot-deal-business-card',
                'sku' => 'CARD-003',
                'sort_order' => 3,
            ],
            [
                'category' => 'business-card',
                'name' => '베스트셀러명함',
                'slug' => 'best-selling-business-card',
                'sku' => 'CARD-004',
                'sort_order' => 4,
            ],
            [
                'category' => 'business-card',
                'name' => '고평량명함',
                'slug' => 'high-weight-business-card',
                'sku' => 'CARD-005',
                'sort_order' => 5,
            ],
            [
                'category' => 'business-card',
                'name' => '벨벳코팅명함',
                'slug' => 'velvet-coated-business-card',
                'sku' => 'CARD-006',
                'sort_order' => 6,
            ],
            [
                'category' => 'business-card',
                'name' => '펄지명함',
                'slug' => 'pearl-paper-business-card',
                'sku' => 'CARD-007',
                'sort_order' => 7,
            ],


            // 스티커
            [
                'category' => 'sticker',
                'name' => '사각스티커',
                'slug' => 'square-sticker',
                'sku' => 'STICKER-001',
                'sort_order' => 1,
            ],
            [
                'category' => 'sticker',
                'name' => '도무송스티커',
                'slug' => 'die-cut-sticker',
                'sku' => 'STICKER-002',
                'sort_order' => 2,
            ],


            // 홍보물
            [
                'category' => 'promotional-materials',
                'name' => '엽서',
                'slug' => 'postcard',
                'sku' => 'PROMO-001',
                'sort_order' => 1,
            ],
            [
                'category' => 'promotional-materials',
                'name' => '티켓',
                'slug' => 'ticket',
                'sku' => 'PROMO-002',
                'sort_order' => 2,
            ],
            [
                'category' => 'promotional-materials',
                'name' => '리플렛',
                'slug' => 'leaflet',
                'sku' => 'PROMO-003',
                'sort_order' => 3,
            ],
            [
                'category' => 'promotional-materials',
                'name' => '팜플렛·전단지',
                'slug' => 'pamphlet-flyer',
                'sku' => 'PROMO-004',
                'sort_order' => 4,
            ],
            [
                'category' => 'promotional-materials',
                'name' => '포스터 (O)',
                'slug' => 'poster-o',
                'sku' => 'PROMO-005',
                'sort_order' => 5,
            ],
            [
                'category' => 'promotional-materials',
                'name' => '합판 전단지',
                'slug' => 'gang-print-flyer',
                'sku' => 'PROMO-006',
                'sort_order' => 6,
            ],
            [
                'category' => 'promotional-materials',
                'name' => '테이블세팅지',
                'slug' => 'table-setting-paper',
                'sku' => 'PROMO-007',
                'sort_order' => 7,
            ],

            // 굿즈
            [
                'category' => 'goods',
                'name' => '떡메모지',
                'slug' => 'sticky-note',
                'sku' => 'GOODS-001',
                'sort_order' => 1,
            ],
            [
                'category' => 'goods',
                'name' => '양식지',
                'slug' => 'form-paper',
                'sku' => 'GOODS-002',
                'sort_order' => 2,
            ],
            [
                'category' => 'goods',
                'name' => 'L홀더',
                'slug' => 'l-holder',
                'sku' => 'GOODS-003',
                'sort_order' => 3,
            ],
            [
                'category' => 'goods',
                'name' => '탁상달력',
                'slug' => 'desk-calendar',
                'sku' => 'GOODS-004',
                'sort_order' => 4,
            ],

            // 봉투
            [
                'category' => 'envelope',
                'name' => '마스타봉투',
                'slug' => 'master-envelope',
                'sku' => 'ENV-001',
                'sort_order' => 1,
            ],
            [
                'category' => 'envelope',
                'name' => '칼라봉투',
                'slug' => 'color-envelope',
                'sku' => 'ENV-002',
                'sort_order' => 2,
            ],


            // 현수막
            [
                'category' => 'hanging-banner',
                'name' => '일반현수막',
                'slug' => 'standard-banner',
                'sku' => 'HB-001',
                'sort_order' => 1,
            ],


            // 배너
            [
                'category' => 'banner',
                'name' => '실내용배너',
                'slug' => 'indoor-banner',
                'sku' => 'BANNER-001',
                'sort_order' => 1,
            ],
            [
                'category' => 'banner',
                'name' => '실외용배너',
                'slug' => 'outdoor-banner',
                'sku' => 'BANNER-002',
                'sort_order' => 2,
            ],
            [
                'category' => 'banner',
                'name' => '미니배너',
                'slug' => 'mini-banner',
                'sku' => 'BANNER-003',
                'sort_order' => 3,
            ],
            [
                'category' => 'banner',
                'name' => '롤업배너',
                'slug' => 'roll-up-banner',
                'sku' => 'BANNER-004',
                'sort_order' => 4,
            ],
            [
                'category' => 'banner',
                'name' => '대형폴배너',
                'slug' => 'big-pole-banner',
                'sku' => 'BANNER-005',
                'sort_order' => 5,
            ],

            // 낱장출력
            [
                'category' => 'single-page-printing',
                'name' => '천소재',
                'slug' => 'fabric',
                'sku' => 'PRINT-001',
                'sort_order' => 1,
            ],
            [
                'category' => 'single-page-printing',
                'name' => '시트지/스티커',
                'slug' => 'sheet-sticker',
                'sku' => 'PRINT-002',
                'sort_order' => 2,
            ],
            [
                'category' => 'single-page-printing',
                'name' => '포스터',
                'slug' => 'poster',
                'sku' => 'PRINT-003',
                'sort_order' => 3,
            ],
            [
                'category' => 'single-page-printing',
                'name' => 'PET/메쉬',
                'slug' => 'pet-mesh',
                'sku' => 'PRINT-004',
                'sort_order' => 4,
            ],
            [
                'category' => 'single-page-printing',
                'name' => '학회포스터',
                'slug' => 'conference-poster',
                'sku' => 'PRINT-005',
                'sort_order' => 5,
            ],
            // POP
            [
                'category' => 'pop-cardboard',
                'name' => '폼보드/포맥스',
                'slug' => 'foam-board',
                'sku' => 'POP-001',
                'sort_order' => 1,
            ],


            // 디자인
            [
                'category' => 'design',
                'name' => '무선책자',
                'slug' => 'design-wireless-book',
                'sku' => 'DESIGN-001',
                'sort_order' => 1,
            ],
            [
                'category' => 'design',
                'name' => '링책자',
                'slug' => 'design-ring-booklet',
                'sku' => 'DESIGN-00022',
                'sort_order' => 2,
            ],
            [
                'category' => 'design',
                'name' => '양장책자',
                'slug' => 'design-hardcover-booklet',
                'sku' => 'DESIGN-003',
                'sort_order' => 3,
            ],
            [
                'category' => 'design',
                'name' => '중철책자',
                'slug' => 'design-saddle-stitched-booklet',
                'sku' => 'DESIGN-004',
                'sort_order' => 4,
            ],
            [
                'category' => 'design',
                'name' => '탁상달력',
                'slug' => 'design-desk-calendar',
                'sku' => 'DESIGN-005',
                'sort_order' => 5,
            ],
            [
                'category' => 'design',
                'name' => '명함',
                'slug' => 'design-business-card',
                'sku' => 'DESIGN-006',
                'sort_order' => 6,
            ],
            [
                'category' => 'design',
                'name' => '엽서',
                'slug' => 'design-postcard',
                'sku' => 'DESIGN-007',
                'sort_order' => 7,
            ],
            [
                'category' => 'design',
                'name' => '티켓',
                'slug' => 'design-ticket',
                'sku' => 'DESIGN-008',
                'sort_order' => 8,
            ],
            [
                'category' => 'design',
                'name' => '리플렛',
                'slug' => 'design-leaflet',
                'sku' => 'DESIGN-009',
                'sort_order' => 9,
            ],
            [
                'category' => 'design',
                'name' => '전단지',
                'slug' => 'design-flyer',
                'sku' => 'DESIGN-010',
                'sort_order' => 10,
            ],
            [
                'category' => 'design',
                'name' => '포스터',
                'slug' => 'design-poster',
                'sku' => 'DESIGN-011',
                'sort_order' => 11,
            ],
            [
                'category' => 'design',
                'name' => '테이블세팅지',
                'slug' => 'design-table-setting-paper',
                'sku' => 'DESIGN-012',
                'sort_order' => 12,
            ],
            [
                'category' => 'design',
                'name' => '스티커',
                'slug' => 'design-sticker',
                'sku' => 'DESIGN-013',
                'sort_order' => 13,
            ],
        ];
    }

    private function truncateProductTables(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        DB::table('product_options')->truncate();
        DB::table('product_option_groups')->truncate();
        DB::table('product_specifications')->truncate();
        DB::table('product_quantity_prices')->truncate();
        DB::table('product_design_modes')->truncate();
        DB::table('product_erp_option')->truncate();
        DB::table('products')->truncate();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }
}
