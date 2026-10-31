<?php

namespace Database\Seeders;

use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionGroupType;
use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Models\PostProcessingPrice;
use App\Models\PostProcessingPriceItem;
use App\Models\ProductOption;
use App\Models\ProductOptionGroup;
use App\Enums\PostProcessingSizeType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class PostProcessingSeeder extends Seeder
{
    private array $groupIds = [];
    private array $optionLocationMap = [];

    public function run(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=OFF');
        }

        // Remove Post Processing in Product Option
        // $this->removePostProcessingInProduct();
        // End
        
        DB::table('post_processing_price_items')->truncate();
        DB::table('post_processing_prices')->truncate();
        // $postProcessingGroupIds = ErpOptionGroup::where('type', ErpOptionGroupType::POST_PROCESSING)->pluck('id')->toArray();
        // DB::table('erp_options')->whereIn('erp_option_group_id', $postProcessingGroupIds)->delete();
        // DB::table('erp_option_groups')->whereIn('id', $postProcessingGroupIds)->delete();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=ON');
        }

        $this->seedGroups();
        $this->seedPrices();
        ProductOptionGroup::updateErpOptionGroupIdByMatchingCode();
        ProductOption::updateErpOptionIdForPostProcessing();

        $this->command->info('Post-processing option groups seeded successfully.');
        $this->command->info('Post-processing prices seeded successfully.');
    }

    private function seedGroups(): void
    {
        $groups = $this->getGroupTemplates();

        foreach ($groups as $groupData) {
            $group = ErpOptionGroup::firstOrCreate(
                ['code' => $groupData['code']->value],
                [
                    'code' => $groupData['code']->value,
                    'label' => $groupData['label'],
                    'type' => $groupData['type'],
                    'display_type' => $groupData['display_type'],
                    'is_required' => $groupData['is_required'],
                    'sort_order' => $groupData['sort_order'],
                ]
            );

            $this->groupIds[$groupData['code']->value] = $group->id;

            foreach ($groupData['options'] as $optionData) {
                $option = ErpOption::firstOrCreate(
                    ['code' => $optionData['code'], 'value' => $optionData['value']],
                    array_merge($optionData, [
                        'erp_option_group_id' => $group->id,
                    ])
                );
                $this->optionLocationMap[$groupData['code']->value][$optionData['value']] = $option->id;
            }
        }
    }

    private function removePostProcessingInProduct(): void
    {
        $postProcessingCodes = [
            ErpOptionGroupCode::FOUNDATION,
            ErpOptionGroupCode::COATED,
            ErpOptionGroupCode::PERFORATION,
            ErpOptionGroupCode::ROUNDING,
            ErpOptionGroupCode::OSHI,
            ErpOptionGroupCode::GROUNDING,
            ErpOptionGroupCode::NUMBERING,
            ErpOptionGroupCode::DOMUSONG
        ];

        $groupIds = DB::table('product_option_groups')
            ->whereIn('code', $postProcessingCodes)
            ->pluck('id');

        DB::table('product_options')
            ->whereIn('option_group_id', $groupIds)
            ->delete();

        DB::table('product_option_groups')
            ->whereIn('erp_option_group_id', $groupIds)
            ->delete();
    }

    private function loadOptionLocationMapFromDatabase(): void
    {
        $groups = ErpOptionGroup::where('type', ErpOptionGroupType::POST_PROCESSING)->get();

        foreach ($groups as $group) {
            $options = ErpOption::where('erp_option_group_id', $group->id)->get();
            foreach ($options as $option) {
                $this->optionLocationMap[$group->code->value][$option->value] = $option->id;
            }
        }
    }

    private function seedPrices(): void
    {
        if (empty($this->optionLocationMap)) {
            $this->loadOptionLocationMapFromDatabase();
        }

        $filePath = database_path('seeders/data/Post_Processing_Costs.xlsx');
        $reader = IOFactory::createReaderForFile($filePath);
        $spreadsheet = $reader->load($filePath);

        $this->processFoundationSheet($spreadsheet->getSheetByName(' Foundation (number of prints)'));
        $this->processCoatingSheet($spreadsheet->getSheetByName(' Coating (number of copies)'));
        $this->processPerforationSheet($spreadsheet->getSheetByName(' Perforation (number of cut pie'));
        $this->processRoundingSheet($spreadsheet->getSheetByName(' Rounding (foundation purchase)'));
        $this->processOsiSheet($spreadsheet->getSheetByName(' Osi (foundation purchase)'));
        $this->processGroundingSheet($spreadsheet->getSheetByName(' Grounding (number of cuts)'));
        $this->processNumberingSheet($spreadsheet->getSheetByName(' Numbering (foundation purchase'));
        $this->processDomusongSheet($spreadsheet->getSheetByName(' Domusong (cutting purchase)'));
    }

    private function processFoundationSheet($sheet): void
    {
        $rows = $sheet->toArray(null, true, true, true);
        $quantityTiers = [];
        foreach (range('E', 'K') as $col) {
            $quantityTiers[] = (int) $this->parseNumber($rows[2][$col] ?? '0');
        }

        foreach ($rows as $rowNum => $row) {
            if ($rowNum <= 2) continue;
            $code = trim($row['B'] ?? '');
            if ($code === '') continue;

            $erpOptionId = $this->optionLocationMap['foundation'][$code] ?? null;

            if (!$erpOptionId) continue;

            $foundationFee = (int) $this->parseNumber($row['D'] ?? '0');

            $price = PostProcessingPrice::create([
                'code' => ErpOptionGroupCode::FOUNDATION->value,
                'erp_option_id' => $erpOptionId,
                'post_processing_size_type' => PostProcessingSizeType::NATIONAL_4,
                'attributes' => [
                    'foundation_fee' => $foundationFee,
                ],
            ]);
            foreach ($quantityTiers as $idx => $quantity) {
                $supplyPrice = (int) $this->parseNumber($row[chr(ord('E') + $idx)] ?? '0');
                if ($supplyPrice <= 0) continue;

                PostProcessingPriceItem::create([
                    'post_processing_price_id' => $price->id,
                    'quantity' => $quantity,
                    'supply_price' => $supplyPrice,
                    'cost' => $supplyPrice,
                ]);
            }
        }
    }

    private function processCoatingSheet($sheet): void
    {
        $rows = $sheet->toArray(null, true, true, true);

        foreach ($rows as $rowNum => $row) {
            if ($rowNum <= 5) continue;
            $printQty = $this->parseNumber($row['A'] ?? '');
            if ($printQty === '') continue;
            $singleErpId = $this->optionLocationMap['coated']['single_sided'] ?? null;
            $doubleErpId = $this->optionLocationMap['coated']['double_sided'] ?? null;

            if ($singleErpId) {
                $this->createCoatingPrice($row, 'single_sided', $singleErpId, $printQty);
            }
            if ($doubleErpId) {
                $this->createCoatingPrice($row, 'double_sided', $doubleErpId, $printQty);
            }
        }
    }

    private function createCoatingPrice($row, string $type, int $erpOptionId, int $printQty): void
    {
        $price = PostProcessingPrice::firstOrCreate(
            [
                'code' => ErpOptionGroupCode::COATED->value,
                'erp_option_id' => $erpOptionId,
            ],
            [
                'code' => ErpOptionGroupCode::COATED->value,
                'erp_option_id' => $erpOptionId,
                'post_processing_size_type' => PostProcessingSizeType::NATIONAL_4,
                // 'attributes' => json_encode(['print_quantity' => $printQty]),
            ]
        );

        $items = [];
        if ($type === 'single_sided') {
            $coatingFee = (int) $this->parseNumber($row['B'] ?? '0');
            $cost = (int) $this->parseNumber($row['D'] ?? '0');
            $n = $this->parseNumber($row['A'] ?? '0');
            $items[] = ['quantity' => (int) $n, 'supply_price' => $coatingFee, 'cost' => $cost];
        } else {
            $coatingFee = (int) $this->parseNumber($row['F'] ?? '0');
            $cost = (int) $this->parseNumber($row['H'] ?? '0');
            $n = $this->parseNumber($row['A'] ?? '0');
            $items[] = ['quantity' => (int) $n, 'supply_price' => $coatingFee, 'cost' => $cost];
        }

        foreach ($items as $item) {
            if ($item['supply_price'] > 0) {
                PostProcessingPriceItem::create([
                    'post_processing_price_id' => $price->id,
                    'quantity' => $item['quantity'],
                    'supply_price' => $item['supply_price'],
                    'cost' => $item['cost'],
                ]);
            }
        }
    }

    private function processPerforationSheet($sheet): void
    {
        $rows = $sheet->toArray(null, true, true, true);
        $optionColumns = [
            '1' => 'B',
            '2' => 'D',
            '3' => 'F',
            '4' => 'H',
        ];

        foreach ($optionColumns as $optionValue => $column) {
            $erpOptionId = $this->optionLocationMap['perforation'][$optionValue] ?? null;
            if (!$erpOptionId) continue;

            $price = PostProcessingPrice::firstOrCreate([
                'code' => ErpOptionGroupCode::PERFORATION->value,
                'erp_option_id' => $erpOptionId,
            ], [
                'code' => ErpOptionGroupCode::PERFORATION->value,
                'erp_option_id' => $erpOptionId,
                'post_processing_size_type' => PostProcessingSizeType::NATIONAL_4,
                'attributes' => [],
            ]);

            foreach ($rows as $rowNum => $row) {
                if ($rowNum < 3) continue;
                $quantity = $this->parseNumber($row['A'] ?? '');
                if ($quantity === '') continue;
                $supplyPrice = (int) $this->parseNumber($row[$column] ?? '0');
                if ($supplyPrice > 0) {
                    PostProcessingPriceItem::create([
                        'post_processing_price_id' => $price->id,
                        'quantity' => (int) $quantity,
                        'supply_price' => $supplyPrice,
                        'cost' => $supplyPrice,
                    ]);
                }
            }
        }
    }

    private function processRoundingSheet($sheet): void
    {
        $rows = $sheet->toArray(null, true, true, true);
        $optionColumns = [
            'full' => 'B',
        ];

        foreach ($optionColumns as $optionValue => $column) {
            $erpOptionId = $this->optionLocationMap['rounding'][$optionValue] ?? null;
            if (!$erpOptionId) continue;

            $price = PostProcessingPrice::firstOrCreate([
                'code' => ErpOptionGroupCode::ROUNDING->value,
                'erp_option_id' => $erpOptionId,
            ], [
                'code' => ErpOptionGroupCode::ROUNDING->value,
                'erp_option_id' => $erpOptionId,
                'post_processing_size_type' => PostProcessingSizeType::NATIONAL_4,
                'attributes' => [],
            ]);

            foreach ($rows as $rowNum => $row) {
                if ($rowNum <= 1) continue;
                $quantity = $this->parseNumber($row['A'] ?? '');
                if ($quantity === '') continue;
                $supplyPrice = (int) $this->parseNumber($row[$column] ?? '0');
                if ($supplyPrice > 0) {
                    PostProcessingPriceItem::create([
                        'post_processing_price_id' => $price->id,
                        'quantity' => (int) $quantity,
                        'supply_price' => $supplyPrice,
                        'cost' => $supplyPrice,
                    ]);
                }
            }
        }
    }

    private function processOsiSheet($sheet): void
    {
        $rows = $sheet->toArray(null, true, true, true);
        $optionColumns = [
            '1 line' => 'B',
            '2 lines' => 'D',
            '3 lines' => 'F',
        ];

        foreach ($optionColumns as $optionValue => $column) {
            $erpOptionId = $this->optionLocationMap['oshi'][$optionValue] ?? null;
            if (!$erpOptionId) continue;

            $price = PostProcessingPrice::firstOrCreate([
                'code' => ErpOptionGroupCode::OSHI->value,
                'erp_option_id' => $erpOptionId,
            ], [
                'code' => ErpOptionGroupCode::OSHI->value,
                'erp_option_id' => $erpOptionId,
                'post_processing_size_type' => PostProcessingSizeType::NATIONAL_4,
                'attributes' => [],
            ]);

            foreach ($rows as $rowNum => $row) {
                if ($rowNum <= 4) continue;
                $quantity = $this->parseNumber($row['A'] ?? '');
                if ($quantity === '') continue;
                $supplyPrice = (int) $this->parseNumber($row[$column] ?? '0');
                if ($supplyPrice > 0) {
                    PostProcessingPriceItem::create([
                        'post_processing_price_id' => $price->id,
                        'quantity' => (int) $quantity,
                        'supply_price' => $supplyPrice,
                        'cost' => $supplyPrice,
                    ]);
                } else {
                    break;
                }
            }
        }
    }

    private function processGroundingSheet($sheet): void
    {
        $rows = $sheet->toArray(null, true, true, true);
        $optionMap = [
            'half_folding' => 'B',
            '3_stage_folding' => 'B',
            '4_stage_folding' => 'B',
            'n_folding' => 'B',
            '4_panel_folding_screen' => 'D',
            '4_fold_gatefold' => 'F',
            '4_fold_scroll' => 'F',
        ];

        foreach ($optionMap as $optionValue => $column) {
            $erpOptionId = $this->optionLocationMap['grounding'][$optionValue] ?? null;
            if (!$erpOptionId) continue;

            $price = PostProcessingPrice::firstOrCreate([
                'code' => ErpOptionGroupCode::GROUNDING->value,
                'erp_option_id' => $erpOptionId,
            ], [
                'code' => ErpOptionGroupCode::GROUNDING->value,
                'erp_option_id' => $erpOptionId,
                'post_processing_size_type' => PostProcessingSizeType::NATIONAL_4,
                'attributes' => [],
            ]);

            foreach ($rows as $rowNum => $row) {
                if ($rowNum <= 4) continue;
                $quantity = $this->parseNumber($row['A'] ?? '');
                if ($quantity === '') continue;
                $supplyPrice = (int) $this->parseNumber($row[$column] ?? '0');
                if ($supplyPrice > 0) {
                    PostProcessingPriceItem::create([
                        'post_processing_price_id' => $price->id,
                        'quantity' => (int) $quantity,
                        'supply_price' => $supplyPrice,
                        'cost' => $supplyPrice,
                    ]);
                } else {
                    break;
                }
            }
        }
    }

    private function processNumberingSheet($sheet): void
    {
        $rows = $sheet->toArray(null, true, true, true);
        $erpOptionId = $this->optionLocationMap['numbering']['numbering'] ?? null;
        if (!$erpOptionId) return;

        $price = PostProcessingPrice::firstOrCreate([
            'code' => ErpOptionGroupCode::NUMBERING->value,
            'erp_option_id' => $erpOptionId,
        ], [
            'code' => ErpOptionGroupCode::NUMBERING->value,
            'erp_option_id' => $erpOptionId,
            'post_processing_size_type' => PostProcessingSizeType::NATIONAL_4,
            'attributes' => [],
        ]);

        foreach ($rows as $rowNum => $row) {
            if ($rowNum <= 2) continue;
            $quantity = $this->parseNumber($row['A'] ?? '');
            if ($quantity === '') continue;
            $supplyPrice = (int) $this->parseNumber($row['B'] ?? '0');
            if ($supplyPrice > 0) {
                PostProcessingPriceItem::create([
                    'post_processing_price_id' => $price->id,
                    'quantity' => (int) $quantity,
                    'supply_price' => $supplyPrice,
                    'cost' => $supplyPrice,
                ]);
            }
        }
    }

    private function processDomusongSheet($sheet): void
    {
        $rows = $sheet->toArray(null, true, true, true);
        $optionColumns = [
            'type_a' => 'B',
            'type_b' => 'D',
            'type_c' => 'F',
        ];

        foreach ($optionColumns as $optionValue => $column) {
            $erpOptionId = $this->optionLocationMap['domusong'][$optionValue] ?? null;
            if (!$erpOptionId) continue;

            $price = PostProcessingPrice::firstOrCreate([
                'code' => ErpOptionGroupCode::DOMUSONG->value,
                'erp_option_id' => $erpOptionId,
            ], [
                'code' => ErpOptionGroupCode::DOMUSONG->value,
                'erp_option_id' => $erpOptionId,
                'post_processing_size_type' => PostProcessingSizeType::NATIONAL_4,
                'attributes' => [],
            ]);

            foreach ($rows as $rowNum => $row) {
                if ($rowNum <= 4) continue;
                $quantity = $this->parseNumber($row['A'] ?? '');
                if ($quantity === '') continue;
                $supplyPrice = (int) $this->parseNumber($row[$column] ?? '0');
                if ($supplyPrice > 0) {
                    PostProcessingPriceItem::create([
                        'post_processing_price_id' => $price->id,
                        'quantity' => (int) $quantity,
                        'supply_price' => $supplyPrice,
                        'cost' => $supplyPrice,
                    ]);
                }
            }
        }
    }

    private function parseNumber(?string $value): int
    {
        if (empty($value)) return 0;
        $value = str_replace(',', '', (string) $value);
        $value = preg_replace('/\s+/', '', $value);
        return (int) $value;
    }

    private function getGroupTemplates(): array
    {
        return [
            [
                'code' => ErpOptionGroupCode::FOUNDATION,
                'label' => '지분',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 1,
                'options' => [
                    ['code' => 'foundation_1x1', 'label' => '1*1', 'value' => '1*1', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'foundation_2x1', 'label' => '2*1', 'value' => '2*1', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'foundation_3x1', 'label' => '3*1', 'value' => '3*1', 'additional_price' => 0, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'foundation_2x2', 'label' => '2*2', 'value' => '2*2', 'additional_price' => 0, 'sort_order' => 4, 'is_active' => true],
                    ['code' => 'foundation_5x1', 'label' => '5*1', 'value' => '5*1', 'additional_price' => 0, 'sort_order' => 5, 'is_active' => true],
                    ['code' => 'foundation_3x2', 'label' => '3*2', 'value' => '3*2', 'additional_price' => 0, 'sort_order' => 6, 'is_active' => true],
                    ['code' => 'foundation_6x1', 'label' => '6*1', 'value' => '6*1', 'additional_price' => 0, 'sort_order' => 7, 'is_active' => true],
                    ['code' => 'foundation_7x1', 'label' => '7*1', 'value' => '7*1', 'additional_price' => 0, 'sort_order' => 8, 'is_active' => true],
                    ['code' => 'foundation_4x2', 'label' => '4*2', 'value' => '4*2', 'additional_price' => 0, 'sort_order' => 9, 'is_active' => true],
                    ['code' => 'foundation_8x1', 'label' => '8*1', 'value' => '8*1', 'additional_price' => 0, 'sort_order' => 10, 'is_active' => true],
                    ['code' => 'foundation_3x3', 'label' => '3*3', 'value' => '3*3', 'additional_price' => 0, 'sort_order' => 11, 'is_active' => true],
                    ['code' => 'foundation_9x1', 'label' => '9*1', 'value' => '9*1', 'additional_price' => 0, 'sort_order' => 12, 'is_active' => true],
                    ['code' => 'foundation_5x2', 'label' => '5*2', 'value' => '5*2', 'additional_price' => 0, 'sort_order' => 13, 'is_active' => true],
                    ['code' => 'foundation_10x1', 'label' => '10*1', 'value' => '10*1', 'additional_price' => 0, 'sort_order' => 14, 'is_active' => true],
                    ['code' => 'foundation_6x2', 'label' => '6*2', 'value' => '6*2', 'additional_price' => 0, 'sort_order' => 15, 'is_active' => true],
                    ['code' => 'foundation_4x3', 'label' => '4*3', 'value' => '4*3', 'additional_price' => 0, 'sort_order' => 16, 'is_active' => true],
                    ['code' => 'foundation_7x2', 'label' => '7*2', 'value' => '7*2', 'additional_price' => 0, 'sort_order' => 17, 'is_active' => true],
                    ['code' => 'foundation_5x3', 'label' => '5*3', 'value' => '5*3', 'additional_price' => 0, 'sort_order' => 18, 'is_active' => true],
                    ['code' => 'foundation_8x2', 'label' => '8*2', 'value' => '8*2', 'additional_price' => 0, 'sort_order' => 19, 'is_active' => true],
                    ['code' => 'foundation_4x4', 'label' => '4*4', 'value' => '4*4', 'additional_price' => 0, 'sort_order' => 20, 'is_active' => true],
                    ['code' => 'foundation_6x3', 'label' => '6*3', 'value' => '6*3', 'additional_price' => 0, 'sort_order' => 21, 'is_active' => true],
                    ['code' => 'foundation_5x4', 'label' => '5*4', 'value' => '5*4', 'additional_price' => 0, 'sort_order' => 22, 'is_active' => true],
                    ['code' => 'foundation_7x3', 'label' => '7*3', 'value' => '7*3', 'additional_price' => 0, 'sort_order' => 23, 'is_active' => true],
                    ['code' => 'foundation_8x3', 'label' => '8*3', 'value' => '8*3', 'additional_price' => 0, 'sort_order' => 24, 'is_active' => true],
                    ['code' => 'foundation_6x4', 'label' => '6*4', 'value' => '6*4', 'additional_price' => 0, 'sort_order' => 25, 'is_active' => true],
                    ['code' => 'foundation_5x5', 'label' => '5*5', 'value' => '5*5', 'additional_price' => 0, 'sort_order' => 26, 'is_active' => true],
                    ['code' => 'foundation_7x4', 'label' => '7*4', 'value' => '7*4', 'additional_price' => 0, 'sort_order' => 27, 'is_active' => true],
                    ['code' => 'foundation_8x4', 'label' => '8*4', 'value' => '8*4', 'additional_price' => 0, 'sort_order' => 28, 'is_active' => true],
                    ['code' => 'foundation_8x5', 'label' => '8*5', 'value' => '8*5', 'additional_price' => 0, 'sort_order' => 29, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::COATED,
                'label' => '코팅',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 2,
                'options' => [
                    ['code' => 'coated_single_sided', 'label' => '단면코팅', 'value' => 'single_sided', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'coated_double_sided', 'label' => '양면코팅', 'value' => 'double_sided', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::PERFORATION,
                'label' => '미싱',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 3,
                'options' => [
                    ['code' => 'perforation_1', 'label' => '1', 'value' => '1', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'perforation_2', 'label' => '2', 'value' => '2', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'perforation_3', 'label' => '3', 'value' => '3', 'additional_price' => 0, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'perforation_4', 'label' => '4', 'value' => '4', 'additional_price' => 0, 'sort_order' => 4, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::ROUNDING,
                'label' => '라운딩',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 4,
                'options' => [
                    ['code' => 'rounding_full', 'label' => '전체 라운딩', 'value' => 'full', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::OSHI,
                'label' => '오시',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 5,
                'options' => [
                    ['code' => 'oshi_1_line', 'label' => '1줄', 'value' => '1 line', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'oshi_2_lines', 'label' => '2줄', 'value' => '2 lines', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'oshi_3_lines', 'label' => '3줄', 'value' => '3 lines', 'additional_price' => 0, 'sort_order' => 3, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::GROUNDING,
                'label' => '접지',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 6,
                'options' => [
                    ['code' => 'grounding_half_folding', 'label' => '2단접지 (반접지)', 'value' => 'half_folding', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'grounding_3_stage_folding', 'label' => '3단접지', 'value' => '3_stage_folding', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'grounding_4_stage_folding', 'label' => '4단접지', 'value' => '4_stage_folding', 'additional_price' => 0, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'grounding_n_folding', 'label' => 'N단접지', 'value' => 'n_folding', 'additional_price' => 0, 'sort_order' => 4, 'is_active' => true],
                    ['code' => 'grounding_4_panel_folding_screen', 'label' => '4단 병풍접지', 'value' => '4_panel_folding_screen', 'additional_price' => 0, 'sort_order' => 5, 'is_active' => true],
                    ['code' => 'grounding_4_fold_gatefold', 'label' => '4단 대문접지', 'value' => '4_fold_gatefold', 'additional_price' => 0, 'sort_order' => 6, 'is_active' => true],
                    ['code' => 'grounding_4_fold_scroll', 'label' => '4단 두루마리접지', 'value' => '4_fold_scroll', 'additional_price' => 0, 'sort_order' => 7, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::NUMBERING,
                'label' => '넘버링',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 7,
                'options' => [
                    ['code' => 'numbering_option', 'label' => '넘버링', 'value' => 'numbering', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::DOMUSONG,
                'label' => '도무송',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 8,
                'options' => [
                    ['code' => 'domusong_type_a', 'label' => 'A형 (원, 사각, 원형 등)', 'value' => 'type_a', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'domusong_type_b', 'label' => 'B형 (사물형상)', 'value' => 'type_b', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'domusong_type_c', 'label' => 'C형 (패키지, 복합형 사물)', 'value' => 'type_c', 'additional_price' => 0, 'sort_order' => 3, 'is_active' => true],
                ],
            ],
        ];
    }
}
