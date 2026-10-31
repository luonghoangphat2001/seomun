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

class StickyNoteUnitPrice extends Seeder
{

    public function __construct(
        protected AdminPaperService $paperService,
        protected AdminProductService $adminProductService,
    ) {}
    public function run(): void
    {
        $product = Product::where('slug', 'sticky-note')->first();
        $this->seedPrices($product);
    }


    private function seedPrices(Product $product): void
    {
        $filePath = database_path('seeders/data/sticky note.xlsx');
        $reader = IOFactory::createReaderForFile($filePath);
        $spreadsheet = $reader->load($filePath);
        $prices = [
            [
                'size_name' => '80x80',
                'width' => 80,
                'height' => 80,
                'price_column' => 'C',
                'cost_column' => 'D',
                'row_start' => 3,
                'row_end' => 32,
            ],
            [
                'size_name' => '86x95',
                'width' => 86,
                'height' => 95,
                'price_column' => 'E',
                'cost_column' => 'F',
                'row_start' => 3,
                'row_end' => 32,
            ],
            [
                'size_name' => '80x106',
                'width' => 80,
                'height' => 106,
                'price_column' => 'G',
                'cost_column' => 'H',
                'row_start' => 3,
                'row_end' => 32,
            ],
            [
                'size_name' => '90x90',
                'width' => 90,
                'height' => 90,
                'price_column' => 'I',
                'cost_column' => 'J',
                'row_start' => 3,
                'row_end' => 32,
            ],
            [
                'size_name' => '90x100',
                'width' => 90,
                'height' => 100,
                'price_column' => 'K',
                'cost_column' => 'L',
                'row_start' => 3,
                'row_end' => 32,
            ],
            [
                'size_name' => '100x140',
                'width' => 100,
                'height' => 140,
                'price_column' => 'M',
                'cost_column' => 'N',
                'row_start' => 3,
                'row_end' => 32,
            ],
        ];
        $this->processSheet($spreadsheet->getSheetByName(' Sticky notes (small size)'), $product, $prices);
        $prices = [
            [
                'size_name' => 'A4',
                'width' => 210,
                'height' => 297,
                'price_column' => 'C',
                'cost_column' => 'D',
                'row_start' => 3,
                'row_end' => 52,
            ],
            [
                'size_name' => 'A5',
                'width' => 148,
                'height' => 210,
                'price_column' => 'E',
                'cost_column' => 'F',
                'row_start' => 3,
                'row_end' => 52,
            ],
            [
                'size_name' => 'B5',
                'width' => 182,
                'height' => 257,
                'price_column' => 'G',
                'cost_column' => 'H',
                'row_start' => 3,
                'row_end' => 52,
            ],
            [
                'size_name' => 'B6',
                'width' => 128,
                'height' => 182,
                'price_column' => 'I',
                'cost_column' => 'J',
                'row_start' => 3,
                'row_end' => 52,
            ],
        ];
        $this->processSheet($spreadsheet->getSheetByName(' Sticky notes (large size)'), $product, $prices);
    }

    private function processSheet($sheet, Product $product, array $prices): void
    {
        $rows = $sheet->toArray(null, true, true, true);

        foreach ($prices as $config) {
            $erpSizeOption = ErpOption::whereHas('size', function ($query) use ($config) {
                $query->where('cutting_width', $config['width'])
                    ->where('cutting_height', $config['height']);
            })->first();

            if (!$erpSizeOption) {
                $this->command->warn("ERP size option not found: {$config['size_name']} ({$config['width']}x{$config['height']})");
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
                    erp_paper_option_id: null,
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
        ?int $erp_paper_option_id,
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
