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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use PhpOffice\PhpSpreadsheet\IOFactory;

class TableSettingPaper extends Seeder
{

    public function __construct(
        protected AdminPaperService $paperService,
        protected AdminProductService $adminProductService,
    ) {}
    public function run(): void
    {
        $product = Product::where('slug', 'table-setting-paper')->first();
        $this->seedPrices($product);
    }


    private function seedPrices(Product $product): void
    {
        $filePath = database_path('seeders/data/table_setting_paper.xlsx');
        $reader = IOFactory::createReaderForFile($filePath);
        $spreadsheet = $reader->load($filePath);
        $this->processSheet($spreadsheet->getSheetByName(' Table setting paper'), $product);
    }

    private function processSheet($sheet, Product $product): void
    {
        $rows = $sheet->toArray(null, true, true, true);

        $prices = [
            [
                'size_name' => 'Verse 8',
                'width' => 368,
                'height' => 258,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 80,
                'price_column' => 'D',
                'cost_column' => 'E',
                'row_start' => 6,
                'row_end' => 25,
            ],
            [
                'size_name' => 'A3',
                'width' => 297,
                'height' => 420,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 80,
                'price_column' => 'D',
                'cost_column' => 'E',
                'row_start' => 31,
                'row_end' => 50,
            ],
            [
                'size_name' => 'A4',
                'width' => 210,
                'height' => 297,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 80,
                'price_column' => 'D',
                'cost_column' => 'E',
                'row_start' => 56,
                'row_end' => 75,
            ],
        ];

        foreach ($prices as $config) {
            $erpSizeOption = ErpOption::whereHas('size', function ($query) use ($config) {
                $query->where('cutting_width', $config['width'])
                    ->where('cutting_height', $config['height']);
            })->first();

            if (!$erpSizeOption) {
                $this->command->warn("ERP size option not found: {$config['size_name']} ({$config['width']}x{$config['height']})");
                continue;
            }

            $paperLabel = sprintf(
                '%s %s %sg',
                $config['paper'],
                $config['color'],
                $config['weight']
            );

            $erpPaperOption = ErpOption::where('label', $paperLabel)->first();

            if (!$erpPaperOption) {
                $this->command->warn('ERP paper option not found: ' . $paperLabel);

                continue;
            }

            foreach ($rows as $rowNum => $row) {
                if (
                    $rowNum < $config['row_start']
                    || $rowNum > $config['row_end']
                ) {
                    continue;
                }

                $printQty = $this->parseNumber($row['A'] ?? '');

                if ($printQty === '') {
                    continue;
                }

                $this->createPrice(
                    row: $row,
                    erp_size_option_id: $erpSizeOption->id,
                    erp_paper_option_id: $erpPaperOption->id,
                    product_id: $product->id,
                    priceColumn: $config['price_column'],
                    costColumn: $config['cost_column'],
                    quantity: (int) $printQty,
                );
            }
        }
    }

    private function createPrice(
        array $row,
        int $erp_size_option_id,
        int $erp_paper_option_id,
        int $product_id,
        string $priceColumn,
        string $costColumn,
        int $quantity,
    ): void {
        $supplyPrice = (int) $this->parseNumber(
            $row[$priceColumn] ?? '0'
        );

        $cost = (int) $this->parseNumber(
            $row[$costColumn] ?? '0'
        );

        if ($supplyPrice <= 0) {
            return;
        }
        $this->command->warn(
            'Processing price: ' . json_encode([
                'erp_size_option_id' => $erp_size_option_id,
                'erp_paper_option_id' => $erp_paper_option_id,
                'product_id' => $product_id,
                'priceColumn' => $supplyPrice,
                'costColumn' => $cost,
                'quantity' => $quantity,
            ], JSON_UNESCAPED_UNICODE)
        );
        $unitPrice = UnitPrice::firstOrCreate(
            [
                'product_id' => $product_id,
                'erp_size_option_id' => $erp_size_option_id,
                'erp_paper_option_id' => $erp_paper_option_id,
            ],
            [
                'is_active' => true,
            ]
        );

        UnitPriceItem::updateOrCreate(
            [
                'unit_price_id' => $unitPrice->id,
                'quantity_min' => $quantity,
            ],
            [
                'price_value' => $supplyPrice,
                'raw_cost' => $cost,
                'attributes' => [
                    'quantity' => $quantity,
                ],
                'is_active' => true,
            ]
        );
    }
    
    private function parseNumber(?string $value): int
    {
        if (empty($value)) return 0;
        $value = str_replace(',', '', (string) $value);
        $value = preg_replace('/\s+/', '', $value);
        return (int) $value;
    }
}
