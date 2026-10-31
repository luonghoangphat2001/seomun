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

class MasterEnvelopeUnitPrice extends Seeder
{

    public function __construct(
        protected AdminPaperService $paperService,
        protected AdminProductService $adminProductService,
    ) {}
    public function run(): void
    {
        $product = Product::where('slug', 'master-envelope')->first();
        UnitPriceItem::whereIn(
            'unit_price_id',
            UnitPrice::where('product_id', $product->id)->pluck('id')
        )->delete();

        UnitPrice::where('product_id', $product->id)->delete();
        $this->seedPrices($product);
    }


    private function seedPrices(Product $product): void
    {
        $filePath = database_path('seeders/data/envelope.xlsx');
        $reader = IOFactory::createReaderForFile($filePath);
        $spreadsheet = $reader->load($filePath);
        $this->processSheet($spreadsheet->getSheetByName(' Master'), $product);
    }

    private function processSheet($sheet, Product $product): void
    {
        $rows = $sheet->toArray(null, true, true, true);

        $prices = [
            [
                'size_name' => '220x105',
                'width' => 220,
                'height' => 105,
                'paper' => '모조',
                'color' => '백색',
                'weight' => 100,
                'price_column' => 'C',
                'cost_column' => 'D',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '220x105',
                'width' => 220,
                'height' => 105,
                'paper' => '줄레자크',
                'color' => '백색',
                'weight' => 110,
                'price_column' => 'E',
                'cost_column' => 'F',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '160x80',
                'width' => 160,
                'height' => 80,
                'paper' => '모조',
                'color' => '백색',
                'weight' => 100,
                'price_column' => 'G',
                'cost_column' => 'H',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '160x80',
                'width' => 160,
                'height' => 80,
                'paper' => '체크레자크',
                'color' => '백색',
                'weight' => 120,
                'price_column' => 'I',
                'cost_column' => 'J',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '173x88',
                'width' => 173,
                'height' => 88,
                'paper' => '모조',
                'color' => '백색',
                'weight' => 100,
                'price_column' => 'K',
                'cost_column' => 'L',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '173x88',
                'width' => 173,
                'height' => 88,
                'paper' => '체크레자크',
                'color' => '백색',
                'weight' => 120,
                'price_column' => 'M',
                'cost_column' => 'N',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '165x115',
                'width' => 165,
                'height' => 115,
                'paper' => '모조',
                'color' => '백색',
                'weight' => 100,
                'price_column' => 'O',
                'cost_column' => 'P',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '180x120',
                'width' => 180,
                'height' => 120,
                'paper' => '모조',
                'color' => '백색',
                'weight' => 100,
                'price_column' => 'Q',
                'cost_column' => 'R',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '195x135',
                'width' => 195,
                'height' => 135,
                'paper' => '모조',
                'color' => '백색',
                'weight' => 100,
                'price_column' => 'S',
                'cost_column' => 'T',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '330x245',
                'width' => 330,
                'height' => 245,
                'paper' => '모조',
                'color' => '백색',
                'weight' => 120,
                'price_column' => 'U',
                'cost_column' => 'V',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '330x245',
                'width' => 330,
                'height' => 245,
                'paper' => '크라프트지',
                'color' => '백색',
                'weight' => 98,
                'price_column' => 'W',
                'cost_column' => 'X',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '260x190',
                'width' => 260,
                'height' => 190,
                'paper' => '모조',
                'color' => '백색',
                'weight' => 100,
                'price_column' => 'Y',
                'cost_column' => 'Z',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '260x190',
                'width' => 260,
                'height' => 190,
                'paper' => '크라프트지',
                'color' => '백색',
                'weight' => 98,
                'price_column' => 'AA',
                'cost_column' => 'AB',
                'row_start' => 5,
                'row_end' => 22,
            ],
            [
                'size_name' => '390x290',
                'width' => 390,
                'height' => 290,
                'paper' => '크라프트지',
                'color' => '백색',
                'weight' => 98,
                'price_column' => 'AC',
                'cost_column' => 'AD',
                'row_start' => 5,
                'row_end' => 22,
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
