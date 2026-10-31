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

class PostProcessingCoatingSeeder extends Seeder
{
    private array $groupIds = [];
    private array $optionLocationMap = [];

    public function run(): void
    {
        $this->seedGroups();
        $this->seedPrices();

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

        $filePath = database_path('seeders/data/Post_processing_price_new.xlsx');
        $reader = IOFactory::createReaderForFile($filePath);
        $spreadsheet = $reader->load($filePath);

        $this->processCoatingSheet($spreadsheet->getSheetByName(' Coating (number of copies)'));
    }

    private function processCoatingSheet($sheet): void
    {
        $rows = $sheet->toArray(null, true, true, true);
        
        $coatings = [
            'single_sided_matte' => [
                'price_column' => 'B',
                'cost_column' => 'D',
            ],
            'single_sided_glossy' => [
                'price_column' => 'B',
                'cost_column' => 'D',
            ],
            'single_sided_velvet' => [
                'price_column' => 'N',
                'cost_column' => 'P',
            ],
            'double_sided_matte' => [
                'price_column' => 'F',
                'cost_column' => 'H',
            ],
            'double_sided_glossy' => [
                'price_column' => 'F',
                'cost_column' => 'H',
            ],
            'double_sided_velvet' => [
                'price_column' => 'R',
                'cost_column' => 'T',
            ],
        ];

        foreach ($rows as $rowNum => $row) {
            if ($rowNum <= 5) {
                continue;
            }

            $printQty = $this->parseNumber($row['A'] ?? '');

            if ($printQty === '') {
                continue;
            }

            foreach ($coatings as $optionCode => $columns) {
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
        int $erpOptionId,
        string $priceColumn,
        string $costColumn,
    ): void {
        $price = PostProcessingPrice::firstOrCreate(
            [
                'code' => ErpOptionGroupCode::COATED->value,
                'erp_option_id' => $erpOptionId,
            ],
            [
                'code' => ErpOptionGroupCode::COATED->value,
                'erp_option_id' => $erpOptionId,
                'post_processing_size_type' => PostProcessingSizeType::NATIONAL_4,
            ]
        );

        $quantity = (int) $this->parseNumber($row['A'] ?? '0');
        $supplyPrice = (int) $this->parseNumber($row[$priceColumn] ?? '0');
        $cost = (int) $this->parseNumber($row[$costColumn] ?? '0');

        if ($supplyPrice <= 0) {
            return;
        }

        PostProcessingPriceItem::create([
            'post_processing_price_id' => $price->id,
            'quantity' => $quantity,
            'supply_price' => $supplyPrice,
            'cost' => $cost,
        ]);
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
                'code' => ErpOptionGroupCode::COATED,
                'label' => '코팅',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 2,
                'options' => [
                    [
                        'code' => 'coated_single_matte',
                        'label' => 'Single-sided matte coating',
                        'value' => 'single_sided_matte',
                        'additional_price' => 0,
                        'sort_order' => 1,
                        'is_active' => true,
                    ],
                    [
                        'code' => 'coated_single_glossy',
                        'label' => 'Single-sided glossy coating',
                        'value' => 'single_sided_glossy',
                        'additional_price' => 0,
                        'sort_order' => 2,
                        'is_active' => true,
                    ],
                    [
                        'code' => 'coated_single_velvet',
                        'label' => 'Single-sided velvet coating',
                        'value' => 'single_sided_velvet',
                        'additional_price' => 0,
                        'sort_order' => 3,
                        'is_active' => true,
                    ],
                    [
                        'code' => 'coated_double_matte',
                        'label' => 'Double-sided matte coating',
                        'value' => 'double_sided_matte',
                        'additional_price' => 0,
                        'sort_order' => 4,
                        'is_active' => true,
                    ],
                    [
                        'code' => 'coated_double_glossy',
                        'label' => 'Double-sided glossy coating',
                        'value' => 'double_sided_glossy',
                        'additional_price' => 0,
                        'sort_order' => 5,
                        'is_active' => true,
                    ],
                    [
                        'code' => 'coated_double_velvet',
                        'label' => 'Double-sided velvet coating',
                        'value' => 'double_sided_velvet',
                        'additional_price' => 0,
                        'sort_order' => 6,
                        'is_active' => true,
                    ],
                ],
            ],
        ];
    }
}
