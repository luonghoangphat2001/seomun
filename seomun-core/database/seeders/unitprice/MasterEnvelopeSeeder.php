<?php

namespace Database\Seeders\unitprice;

use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionGroupType;
use App\Enums\PaperCategory;
use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Models\Paper;
use App\Models\Product;
use App\Models\SizeOption;
use App\Models\UnitPrice;
use App\Models\UnitPriceItem;
use App\Services\Admin\AdminPaperService;
use App\Services\Admin\AdminProductService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MasterEnvelopeSeeder extends Seeder
{

    public function __construct(
        protected AdminPaperService $paperService,
        protected AdminProductService $adminProductService,
    ) {}
    public function run(): void
    {
        $paper = $this->paperOption();
        $size = $this->sizeOption();
        $productOptionGroups = array_merge($paper, $size);
        $square = Product::where('slug', 'square-ticket')->first();
        $diecut = Product::where('slug', 'diecut-ticket')->first();
        $this->adminProductService->addOptionGroupsExistByCodeAndLabel($square, $productOptionGroups);
        $this->adminProductService->addOptionGroupsExistByCodeAndLabel($diecut, $productOptionGroups);
    }

    public function paperOption()
    {
        $sampleData = $this->papers;
        $erpOptionGroupIds = ErpOptionGroup::whereIn('code', [
            ErpOptionGroupCode::PAPER_TYPE->value,
            ErpOptionGroupCode::PAPER_COLOR->value,
            ErpOptionGroupCode::PAPER_WEIGHT->value,
        ])->pluck('id', 'code');

        $uniqueCombinations = array_unique(array_map('json_encode', array_map(fn($data) => [
            $data['paper_type'],
            $data['color'],
            $data['basis_weight_gsm'],
        ], $sampleData)));

        $uniqueCombinations = array_map('json_decode', $uniqueCombinations);
        $erpOptionIds = [];

        $typeGroupId = $erpOptionGroupIds[ErpOptionGroupCode::PAPER_TYPE->value];
        $colorGroupId = $erpOptionGroupIds[ErpOptionGroupCode::PAPER_COLOR->value];
        $weightGroupId = $erpOptionGroupIds[ErpOptionGroupCode::PAPER_WEIGHT->value];

        foreach ($uniqueCombinations as [$paperType, $color, $weight]) {
            $paperOption = ErpOption::firstOrCreate([
                'code' => 'paper_type_' . $paperType
            ], [
                'erp_option_group_id' => $typeGroupId,
                'label' => $paperType,
                'value' => $paperType,
            ]);

            $colorOption = ErpOption::firstOrCreate([
                'code' => 'paper_color_' . "white",
            ], [
                'erp_option_group_id' => $colorGroupId,
                'code' => 'paper_color_' . "white",
                'label' => "white",
                'value' => "white",
            ]);

            $weightOption = ErpOption::firstOrCreate([
                'code' => 'paper_weight_' . $weight,
            ], [
                'erp_option_group_id' => $weightGroupId,

                'value' => $weight,
                'label' => $weight,
            ]);

            $erpOptionIds[$typeGroupId . '_' . $paperType] = $paperOption->id;
            $erpOptionIds[$colorGroupId . '_' . $color] = $colorOption->id;
            $erpOptionIds[$weightGroupId . '_' . $weight] = $weightOption->id;
        }

        $group = [];
        $options = [];
        $firstItem = 1;
        foreach ($sampleData as $data) {
            $paper = Paper::firstOrCreate([
                'name' => $data['paper_type'] . ' ' . $data['color'] . ' ' . $data['basis_weight_gsm'] . 'g',
            ], [
                'category' => PaperCategory::GENERAL,
                'manufacturer' => '',
                'name' => $data['paper_type'] . ' ' . $data['color'] . ' ' . $data['basis_weight_gsm'] . 'g',
                'specification' => [
                    'thickness_mm' => $data['thickness_mm'],
                    'unit_weight_g' => $data['unit_weight_g'],
                ],
                'pattern' => 'None',
                'paper_type_option_value_id' => $erpOptionIds[$typeGroupId . '_' . $data['paper_type']] ?? null,
                'paper_color_option_value_id' => $erpOptionIds[$colorGroupId . '_' . $data['color']] ?? null,
                'paper_weight_option_value_id' => $erpOptionIds[$weightGroupId . '_' . $data['basis_weight_gsm']] ?? null,
                'is_active' => true,
            ]);

            $erpOptions = $this->paperService->syncErpOptions($paper);

            if ($firstItem) {
                $group = [
                    'code' => 'paper',
                    'erp_option_group_id' => $erpOptions['erp_option_group_id'],
                    'name' => 'Paper',
                    'display_type' => 'select',
                    'is_required' => true,
                    'sort_order' => 2,
                    'options' => []
                ];
                $firstItem = 0;
            }
            $options = array_merge($options, [
                [
                    'label' => $paper->name,
                    'value' => 'paper_' . $paper->id,
                    'erp_option_id' => $erpOptions['erp_option_id'],
                    'additional_price' => 0,
                    'metadata' => [],
                    'sort_order' => 0,
                    'is_active' => true,
                ],
            ]);
        }
        $group['options'] = $options;
        return $group;
    }


    public function sizeOption()
    {
        $erpOptionGroup = ErpOptionGroup::where('code', ErpOptionGroupCode::SIZE->value)->first();
        $sizes = $this->sizes;

        $firstItem = 1;
        $options = [];
        foreach ($sizes as $size) {
            $sizeOption = SizeOption::firstOrCreate(['cutting_width' => $size['cutting_width'], 'cutting_height' => $size['cutting_height']], $size);

            $erpOption = ErpOption::firstOrCreate([
                'erp_option_group_id' => $erpOptionGroup->id,
                'size_option_id' => $sizeOption->id,
            ], [
                'erp_option_group_id' => $erpOptionGroup->id,
                'size_option_id' => $sizeOption->id,
                'label' => $sizeOption->name,
                'code' => 'size_option_' . $sizeOption->id,
                'value' => $sizeOption->name,
                'attributes' => [
                    'cutting_width' => $sizeOption->cutting_width,
                    'cutting_height' => $sizeOption->cutting_height,
                    'working_width' => $sizeOption->working_width,
                    'working_height' => $sizeOption->working_height,
                ],
                'is_active' => true,
            ]);

            if ($firstItem) {
                $group = [
                    'code' => 'size',
                    'erp_option_group_id' => $erpOptionGroup['erp_option_group_id'],
                    'name' => '사이즈',
                    'display_type' => 'select',
                    'is_required' => true,
                    'sort_order' => 1,
                    'options' => []
                ];
                $firstItem = 0;
            }
            $options = array_merge($options, [
                [
                    'label' => $sizeOption->name,
                    'value' => 'size_' . $sizeOption->name,
                    'erp_option_id' => $erpOption['erp_option_id'],
                    'additional_price' => 0,
                    'metadata' => [],
                    'sort_order' => 0,
                    'is_active' => true,
                ],
            ]);
        }

        $group['options'] = $options;
        return $group;
    }

    public $sizes = [
        ['name' => '90x50', 'cutting_width' => 90, 'cutting_height' => 50, 'working_width' => 92, 'working_height' => 52],
        ['name' => '86x52', 'cutting_width' => 86, 'cutting_height' => 52, 'working_width' => 88, 'working_height' => 54],
    ];

    public $papers = [
        [
            'paper_type' => 'imitation',
            'color' => "white",
            'basis_weight_gsm' => 80,
            'thickness_mm' => 0.08,
            'unit_weight_g' => 2,
            'pages_count' => 100,
            'double_sided_volume' => null,
            'book_spine_mm' => 8,
            'total_weight_g' => 200,
            'total_weight_kg' => 0.2,
        ],
        [
            'paper_type' => 'Julezak',
            'color' => "white",
            'basis_weight_gsm' => 80,
            'thickness_mm' => 0.09,
            'unit_weight_g' => 4.6,
            'pages_count' => 500,
            'double_sided_volume' => null,
            'book_spine_mm' => 45,
            'total_weight_g' => 2300,
            'total_weight_kg' => 2.3,
        ],
        [
            'paper_type' => 'Special ultra-strong adhesive art paper',
            'color' => "white",
            'basis_weight_gsm' => 100,
            'thickness_mm' => 0.11,
            'unit_weight_g' => 6.3,
            'pages_count' => 50,
            'double_sided_volume' => null,
            'book_spine_mm' => 5.5,
            'total_weight_g' => 315,
            'total_weight_kg' => 0.315,
        ],
        [
            'paper_type' => 'Transparent Deadlong',
            'color' => "white",
            'basis_weight_gsm' => 50,
            'thickness_mm' => 0.131,
            'unit_weight_g' => 7.5,
            'pages_count' => 50,
            'double_sided_volume' => null,
            'book_spine_mm' => 6.55,
            'total_weight_g' => 375,
            'total_weight_kg' => 0.375,
        ],
        [
            'paper_type' => 'Distribution site',
            'color' => "white",
            'basis_weight_gsm' => 80,
            'thickness_mm' => 0.16,
            'unit_weight_g' => 9,
            'pages_count' => 50,
            'double_sided_volume' => null,
            'book_spine_mm' => 8,
            'total_weight_g' => 450,
            'total_weight_kg' => 0.45,
        ],
        [
            'paper_type' => 'imitation',
            'color' => "white",
            'basis_weight_gsm' => 80,
            'thickness_mm' => 0.2,
            'unit_weight_g' => 11.3,
            'pages_count' => 50,
            'double_sided_volume' => null,
            'book_spine_mm' => 10,
            'total_weight_g' => 565,
            'total_weight_kg' => 0.565,
        ],
        [
            'paper_type' => 'Kraft paper',
            'color' =>  "white",
            'basis_weight_gsm' => 57,
            'thickness_mm' => 0.23,
            'unit_weight_g' => 13.2,
            'pages_count' => 50,
            'double_sided_volume' => null,
            'book_spine_mm' => 11.5,
            'total_weight_g' => 660,
            'total_weight_kg' => 0.66,
        ],
    ];



    private function seedPrices(): void
    {
        if (empty($this->optionLocationMap)) {
            $this->loadOptionLocationMapFromDatabase();
        }

        $filePath = database_path('seeders/data/Post_processing_price_new.xlsx');
        $reader = IOFactory::createReaderForFile($filePath);
        $spreadsheet = $reader->load($filePath);

        $this->processSheet($spreadsheet->getSheetByName('  Art paper (glossy coated, uncoated)'));
    }

    private function processSheet($sheet): void
    {
        $rows = $sheet->toArray(null, true, true, true);

        $prices = [
            [
                'width' => 220,
                'height' => 105,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 100,
                'price_column' => 'B',
                'cost_column' => 'D',
            ]
        ];

        foreach ($rows as $rowNum => $row) {
            if ($rowNum <= 5) {
                continue;
            }

            $printQty = $this->parseNumber($row['A'] ?? '');

            if ($printQty === '') {
                continue;
            }

            foreach ($prices as $optionCode => $columns) {
                $erpOptionId = $this->optionLocationMap['coated'][$optionCode] ?? null;

                if (!$erpOptionId) {
                    continue;
                }

                $this->createCoatingPrice(
                    $row,
                    $erpOptionId,
                    $columns['price_column'],
                    $columns['cost_column'],
                );
            }
        }
    }

    private function createCoatingPrice(
        array $row,
        int $erp_size_option_id,
        int $erp_paper_option_id,
        int $product_id,
        string $priceColumn,
        string $costColumn,
        int $quantity,
    ): void {
        $price = UnitPrice::firstOrCreate(
            [
                'product_id' => $product_id,
                'erp_size_option_id' => $erp_size_option_id,
                'erp_paper_option_id' => $erp_paper_option_id,
            ],
            [
                'is_active' => true,
            ]
        );

        $supplyPrice = (int) $this->parseNumber($row[$priceColumn] ?? '0');
        $cost = (int) $this->parseNumber($row[$costColumn] ?? '0');

        if ($supplyPrice <= 0) {
            return;
        }

        UnitPriceItem::create([
            'unit_price_id' => $price->id,
            'price_value' => $supplyPrice,
            'raw_cost' => $cost,
            'attributes' => [
                'quantity' => $quantity,
            ],
            'quantity_min' => $quantity,
            'is_active' => true,
        ]);
    }



    private function parseNumber(?string $value): int
    {
        if (empty($value)) return 0;
        $value = str_replace(',', '', (string) $value);
        $value = preg_replace('/\s+/', '', $value);
        return (int) $value;
    }
}
