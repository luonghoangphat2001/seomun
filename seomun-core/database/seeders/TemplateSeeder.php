<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\SizeOption;
use App\Models\Template;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TemplateSeeder extends Seeder
{
    /** Slugs of products that will get templates (must exist after ProductSeeder). */
    private const STANDARD_BC_SLUGS = [
        'standard-business-card',
        'hot-deal-business-card',
        'bestselling-business-card'
    ];

    private const PREMIUM_BC_SLUGS = [];

    private const SMALL_QUANTITY_BC_SLUGS = [];

    private const STICKER_SLUGS = [];

    private const STANDARD_BC_LABELS = [
        '블랙',
        '화이트',
        '그린',
        '블루',
        '퍼플',
        '크림',
        '네이비',
        '버건디',
        '그레이',
        '골드',
    ];

    /**
     * Run the database seeds.
     * Truncates templates table first so each run starts clean (no leftover data).
     */
    public function run(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }
        DB::table('templates')->truncate();
        if (DB::getDriverName() === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }

        $adminUser = User::first();
        $templates = [];

        // --- Namecard: Standard BC (2 templates per product: 기본형 + 미니멀) ---
        $namecardLayout = $this->getNamecardLayoutConfig();
        foreach (self::STANDARD_BC_SLUGS as $index => $slug) {
            $product = Product::where('slug', $slug)->first();
            if (! $product) {
                continue;
            }
            $productId = $product->id;
            $sizeOptions = SizeOption::whereHas('erpOptions.erpOptionGroup.productOptionGroups', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })->get();

            if ($sizeOptions->isEmpty()) {
                continue;
            }
            $sizeOption = $sizeOptions->first();
            $label = self::STANDARD_BC_LABELS[$index] ?? $slug;
            $templates[] = $this->namecardTemplate(
                "명함 기본형 - {$label}",
                $product->id,
                $namecardLayout,
                '/storage/templates/business-card-standard.ai',
                $sizeOption
            );
        }

        // --- Stickers (1 template per product) ---
        $stickerLabels = ['원형', '사각형', '별형', '하트형'];
        $stickerLayout = $this->getStickerLayoutConfig();
        foreach (self::STICKER_SLUGS as $index => $slug) {
            $product = Product::where('slug', $slug)->first();
            if (! $product) {
                continue;
            }
            $label = $stickerLabels[$index] ?? $slug;
            $templates[] = [
                'name' => "스티커 - {$label}",
                'product_id' => $product->id,
                'specifications' => [
                    'size' => '90x50mm',
                    'sides' => 'single',
                    'material' => 'Glossy vinyl',
                ],
                'file_path' => '/storage/templates/sticker-' . $slug . '.ai',
                'safety_line' => ['margin' => '2mm'],
                'cut_line' => ['bleed' => '2mm'],
                'font_set' => ['primary' => 'Pretendard'],
                'color_set' => ['primary' => '#FF0077', 'secondary' => '#000000'],
                'spot_color' => ['white_ink' => true],
                'layout_config' => $stickerLayout,
                'editor_permission' => ['allow_text_edit' => false, 'allow_image_replace' => true],
                'preview_images' => ['/storage/templates/previews/sticker-' . $slug . '.jpg'],
                'is_active' => true,
            ];
        }

        // --- Generic templates (no product_id) ---
        // $templates[] = $this->flyerTemplate();
        // $templates[] = $this->posterTemplate();
        // $templates[] = $this->letterheadTemplate();
        // $templates[] = $this->envelopeTemplate();
        // $templates[] = $this->rollupTemplate();

        foreach ($templates as $data) {
            Template::updateOrCreate(
                ['name' => $data['name']],
                array_merge($data, ['created_by' => $adminUser?->id])
            );
        }

        $this->command->info('Templates seeded: ' . count($templates) . ' templates (many linked to products).');
    }

    private function getNamecardLayoutConfig(): array
    {
        return [
            'version' => 1,
            'page' => [
                'width' => 90,
                'height' => 54,
                'unit' => 'mm',
                'sides' => ['front', 'back'],
            ],
            'background' => [
                'front' => '/storage/templates/previews/business-card-standard-front.jpg',
                'back' => '/storage/templates/previews/business-card-standard-back.jpg',
            ],
            'layers' => [
                [
                    'id' => 'name-1',
                    'type' => 'text',
                    'side' => 'front',
                    'field_key' => 'name',
                    'label' => '이름',
                    'default_value' => '홍길동',
                    'position' => ['x' => 10, 'y' => 12],
                    'size' => ['width' => 40, 'height' => 8],
                    'style' => [
                        'font_family' => 'Pretendard',
                        'font_weight' => 'bold',
                        'font_size' => 9.5,
                        'line_height' => 1.2,
                        'letter_spacing' => 0,
                        'color' => '#000000',
                        'align' => 'left',
                    ],
                    'options' => ['editable' => true, 'group' => null],
                ],
                [
                    'id' => 'eng_name-1',
                    'type' => 'text',
                    'side' => 'front',
                    'field_key' => 'eng_name',
                    'label' => '영문이름',
                    'default_value' => 'Hong Gildong',
                    'position' => ['x' => 10, 'y' => 22],
                    'size' => ['width' => 50, 'height' => 6],
                    'style' => [
                        'font_family' => 'Pretendard',
                        'font_weight' => 'regular',
                        'font_size' => 8,
                        'line_height' => 1.1,
                        'letter_spacing' => 0,
                        'color' => '#333333',
                        'align' => 'left',
                    ],
                    'options' => ['editable' => true, 'group' => null],
                ],
                [
                    'id' => 'title-1',
                    'type' => 'text',
                    'side' => 'front',
                    'field_key' => 'title',
                    'label' => '직급',
                    'default_value' => '팀장',
                    'position' => ['x' => 10, 'y' => 30],
                    'size' => ['width' => 35, 'height' => 6],
                    'style' => [
                        'font_family' => 'Pretendard',
                        'font_weight' => 'medium',
                        'font_size' => 7.5,
                        'line_height' => 1.1,
                        'letter_spacing' => 0,
                        'color' => '#555555',
                        'align' => 'left',
                    ],
                    'options' => ['editable' => true, 'group' => null],
                ],
                [
                    'id' => 'mobile-1',
                    'type' => 'text',
                    'side' => 'front',
                    'field_key' => 'mobile',
                    'label' => '핸드폰',
                    'default_value' => '010-1234-5678',
                    'position' => ['x' => 10, 'y' => 38],
                    'size' => ['width' => 45, 'height' => 5],
                    'style' => [
                        'font_family' => 'Pretendard',
                        'font_weight' => 'regular',
                        'font_size' => 7,
                        'line_height' => 1.1,
                        'letter_spacing' => 0,
                        'color' => '#333333',
                        'align' => 'left',
                    ],
                    'options' => ['editable' => true, 'group' => null],
                ],
                [
                    'id' => 'email-1',
                    'type' => 'text',
                    'side' => 'front',
                    'field_key' => 'email',
                    'label' => '이메일',
                    'default_value' => 'hong@example.com',
                    'position' => ['x' => 10, 'y' => 45],
                    'size' => ['width' => 55, 'height' => 5],
                    'style' => [
                        'font_family' => 'Pretendard',
                        'font_weight' => 'regular',
                        'font_size' => 6.5,
                        'line_height' => 1.1,
                        'letter_spacing' => 0,
                        'color' => '#333333',
                        'align' => 'left',
                    ],
                    'options' => ['editable' => true, 'group' => null],
                ],
                [
                    'id' => 'address-1',
                    'type' => 'text',
                    'side' => 'front',
                    'field_key' => 'address',
                    'label' => '주소',
                    'default_value' => '서울시 강남구',
                    'position' => ['x' => 10, 'y' => 52],
                    'size' => ['width' => 70, 'height' => 5],
                    'style' => [
                        'font_family' => 'Pretendard',
                        'font_weight' => 'regular',
                        'font_size' => 6,
                        'line_height' => 1.1,
                        'letter_spacing' => 0,
                        'color' => '#666666',
                        'align' => 'left',
                    ],
                    'options' => ['editable' => true, 'group' => null],
                ],
            ],
        ];
    }

    private function getStickerLayoutConfig(): array
    {
        return [
            'version' => 1,
            'page' => ['width' => 90, 'height' => 50, 'unit' => 'mm'],
            'background' => ['front' => '/storage/templates/previews/sticker-default.jpg'],
            'layers' => [],
        ];
    }

    private function namecardTemplate(
        string $name,
        int $productId,
        array $layoutConfig,
        string $filePath,
        object $sizeOption
    ): array {
        return [
            'name' => $name,
            'product_id' => $productId,
            'size_option_id' => $sizeOption->id,
            'specifications' => [
                'width' => $sizeOption->cutting_width,
                'height' => $sizeOption->cutting_height,
                'sides' => 'double',
            ],
            'file_path' => $filePath,
            'safety_line' => ['margin' => '3mm'],
            'cut_line' => ['bleed' => '3mm'],
            'font_set' => ['primary' => 'Noto Sans KR', 'secondary' => 'Roboto'],
            'color_set' => ['primary' => '#0055FF', 'secondary' => '#222222'],
            'spot_color' => null,
            'layout_config' => $layoutConfig,
            'editor_permission' => ['allow_text_edit' => true, 'allow_image_replace' => true],
            'preview_images' => [
                '/storage/templates/previews/business-card-standard-front.jpg',
                '/storage/templates/previews/business-card-standard-back.jpg',
            ],
            'is_active' => true,
        ];
    }

    private function flyerTemplate(): array
    {
        return [
            'name' => 'Flyer A4 - Single Side',
            'product_id' => null,
            'specifications' => ['size' => 'A4', 'sides' => 'single', 'paper' => 'Artpaper 150gsm'],
            'file_path' => '/storage/templates/flyer-a4-single.ai',
            'safety_line' => ['margin' => '4mm'],
            'cut_line' => ['bleed' => '3mm'],
            'font_set' => ['primary' => 'Pretendard'],
            'color_set' => ['primary' => '#FF5500', 'secondary' => '#111111'],
            'spot_color' => null,
            'layout_config' => [
                'version' => 1,
                'page' => ['width' => 210, 'height' => 297, 'unit' => 'mm'],
                'background' => ['front' => '/storage/templates/previews/flyer-a4-single.jpg'],
                'layers' => [
                    [
                        'id' => 'title-1',
                        'type' => 'text',
                        'side' => 'front',
                        'field_key' => 'title',
                        'label' => '제목',
                        'default_value' => '플라이어 제목',
                        'position' => ['x' => 20, 'y' => 30],
                        'size' => ['width' => 170, 'height' => 15],
                        'style' => ['font_family' => 'Pretendard', 'font_weight' => 'bold', 'font_size' => 18, 'line_height' => 1.2, 'color' => '#111111', 'align' => 'left'],
                        'options' => ['editable' => true],
                    ],
                ],
            ],
            'editor_permission' => ['allow_text_edit' => true, 'allow_image_replace' => false],
            'preview_images' => ['/storage/templates/previews/flyer-a4-single.jpg'],
            'is_active' => true,
        ];
    }

    private function posterTemplate(): array
    {
        return [
            'name' => 'Poster A2 - Inactive Sample',
            'product_id' => null,
            'specifications' => ['size' => 'A2', 'sides' => 'single', 'paper' => 'Artpaper 200gsm'],
            'file_path' => '/storage/templates/poster-a2.ai',
            'safety_line' => ['margin' => '5mm'],
            'cut_line' => ['bleed' => '3mm'],
            'font_set' => ['primary' => 'Noto Sans KR'],
            'color_set' => ['primary' => '#00AA88'],
            'spot_color' => ['varnish' => true],
            'layout_config' => [
                'version' => 1,
                'page' => ['width' => 420, 'height' => 594, 'unit' => 'mm'],
                'background' => ['front' => '/storage/templates/previews/poster-a2.jpg'],
                'layers' => [],
            ],
            'editor_permission' => ['allow_text_edit' => false, 'allow_image_replace' => false],
            'preview_images' => ['/storage/templates/previews/poster-a2.jpg'],
            'is_active' => false,
        ];
    }

    private function letterheadTemplate(): array
    {
        return [
            'name' => 'Letterhead A4 - Standard',
            'product_id' => null,
            'specifications' => ['size' => 'A4', 'sides' => 'single', 'paper' => 'Bond 100gsm'],
            'file_path' => '/storage/templates/letterhead-a4.ai',
            'safety_line' => ['margin' => '5mm'],
            'cut_line' => ['bleed' => '0mm'],
            'font_set' => ['primary' => 'Roboto'],
            'color_set' => ['primary' => '#222222', 'secondary' => '#DDDDDD'],
            'spot_color' => null,
            'layout_config' => [
                'version' => 1,
                'page' => ['width' => 210, 'height' => 297, 'unit' => 'mm'],
                'background' => ['front' => '/storage/templates/previews/letterhead-a4.jpg'],
                'layers' => [
                    [
                        'id' => 'company_name-1',
                        'type' => 'text',
                        'side' => 'front',
                        'field_key' => 'company_name',
                        'label' => '회사명',
                        'default_value' => 'Company Name',
                        'position' => ['x' => 20, 'y' => 25],
                        'size' => ['width' => 100, 'height' => 10],
                        'style' => ['font_family' => 'Roboto', 'font_weight' => 'bold', 'font_size' => 12, 'color' => '#222222', 'align' => 'left'],
                        'options' => ['editable' => true],
                    ],
                ],
            ],
            'editor_permission' => ['allow_text_edit' => true, 'allow_image_replace' => false],
            'preview_images' => ['/storage/templates/previews/letterhead-a4.jpg'],
            'is_active' => true,
        ];
    }

    private function envelopeTemplate(): array
    {
        return [
            'name' => 'Envelope DL - Window',
            'product_id' => null,
            'specifications' => ['size' => 'DL', 'sides' => 'single', 'paper' => 'Offset 100gsm'],
            'file_path' => '/storage/templates/envelope-dl-window.ai',
            'safety_line' => ['margin' => '4mm'],
            'cut_line' => ['bleed' => '2mm'],
            'font_set' => ['primary' => 'Noto Sans KR'],
            'color_set' => ['primary' => '#333333'],
            'spot_color' => null,
            'layout_config' => [
                'version' => 1,
                'page' => ['width' => 220, 'height' => 110, 'unit' => 'mm'],
                'background' => ['front' => '/storage/templates/previews/envelope-dl-window.jpg'],
                'layers' => [
                    [
                        'id' => 'address-1',
                        'type' => 'text',
                        'side' => 'front',
                        'field_key' => 'address',
                        'label' => '수신주소',
                        'default_value' => '서울시 강남구',
                        'position' => ['x' => 30, 'y' => 45],
                        'size' => ['width' => 120, 'height' => 10],
                        'style' => ['font_family' => 'Noto Sans KR', 'font_weight' => 'regular', 'font_size' => 9, 'color' => '#333333', 'align' => 'left'],
                        'options' => ['editable' => true],
                    ],
                ],
            ],
            'editor_permission' => ['allow_text_edit' => true, 'allow_image_replace' => true],
            'preview_images' => ['/storage/templates/previews/envelope-dl-window.jpg'],
            'is_active' => true,
        ];
    }

    private function rollupTemplate(): array
    {
        return [
            'name' => 'Roll-up Banner 800x2000',
            'product_id' => null,
            'specifications' => ['size' => '800x2000mm', 'sides' => 'single', 'material' => 'PVC Banner'],
            'file_path' => '/storage/templates/rollup-800x2000.ai',
            'safety_line' => ['margin' => '10mm'],
            'cut_line' => ['bleed' => '5mm'],
            'font_set' => ['primary' => 'Noto Sans KR'],
            'color_set' => ['primary' => '#003366', 'secondary' => '#FFFFFF'],
            'spot_color' => null,
            'layout_config' => [
                'version' => 1,
                'page' => ['width' => 800, 'height' => 2000, 'unit' => 'mm'],
                'background' => ['front' => '/storage/templates/previews/rollup-800x2000.jpg'],
                'layers' => [
                    [
                        'id' => 'title-1',
                        'type' => 'text',
                        'side' => 'front',
                        'field_key' => 'title',
                        'label' => '제목',
                        'default_value' => '배너 제목',
                        'position' => ['x' => 50, 'y' => 100],
                        'size' => ['width' => 700, 'height' => 80],
                        'style' => ['font_family' => 'Noto Sans KR', 'font_weight' => 'bold', 'font_size' => 72, 'color' => '#003366', 'align' => 'center'],
                        'options' => ['editable' => true],
                    ],
                ],
            ],
            'editor_permission' => ['allow_text_edit' => true, 'allow_image_replace' => false],
            'preview_images' => ['/storage/templates/previews/rollup-800x2000.jpg'],
            'is_active' => true,
        ];
    }
}
