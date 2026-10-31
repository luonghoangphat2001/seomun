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

class PosterUnitPriceSeeder extends Seeder
{

    public function __construct(
        protected AdminPaperService $paperService,
        protected AdminProductService $adminProductService,
    ) {}
    public function run(): void
    {
        $product = Product::where('slug', 'poster-o')->first();
        $this->seedPrices($product);
    }


    private function seedPrices(Product $product): void
    {
        $filePath = database_path('seeders/data/Outsourced_Poster.xlsx');
        $reader = IOFactory::createReaderForFile($filePath);
        $spreadsheet = $reader->load($filePath);
        $this->processSheet($spreadsheet->getSheetByName(' Sheet1'), $product);
    }

    private function processSheet($sheet, Product $product): void
    {
        $rows = $sheet->toArray(null, true, true, true);

        $prices = [
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 150,
                'price_column' => 'D',
                'cost_column' => 'E',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 180,
                'price_column' => 'F',
                'cost_column' => 'G',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 200,
                'price_column' => 'H',
                'cost_column' => 'I',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 250,
                'price_column' => 'J',
                'cost_column' => 'K',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 300,
                'price_column' => 'L',
                'cost_column' => 'M',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 150,
                'price_column' => 'D',
                'cost_column' => 'E',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 180,
                'price_column' => 'F',
                'cost_column' => 'G',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 200,
                'price_column' => 'H',
                'cost_column' => 'I',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 250,
                'price_column' => 'J',
                'cost_column' => 'K',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 300,
                'price_column' => 'L',
                'cost_column' => 'M',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 150,
                'price_column' => 'N',
                'cost_column' => 'O',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 180,
                'price_column' => 'P',
                'cost_column' => 'Q',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 220,
                'price_column' => 'R',
                'cost_column' => 'S',
                'row_start' => 3,
                'row_end' => 60,
            ],
            [
                'size_name' => 'A2',
                'width' => 420,
                'height' => 594,
                'paper' => 'Rendezvous',
                'color' => 'Natural',
                'weight' => 210,
                'price_column' => 'T',
                'cost_column' => 'U',
                'row_start' => 3,
                'row_end' => 60,
            ],

            //B2

            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 150,
                'price_column' => 'D',
                'cost_column' => 'E',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 180,
                'price_column' => 'F',
                'cost_column' => 'G',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 200,
                'price_column' => 'H',
                'cost_column' => 'I',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 250,
                'price_column' => 'J',
                'cost_column' => 'K',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 300,
                'price_column' => 'L',
                'cost_column' => 'M',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 150,
                'price_column' => 'D',
                'cost_column' => 'E',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 180,
                'price_column' => 'F',
                'cost_column' => 'G',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 200,
                'price_column' => 'H',
                'cost_column' => 'I',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 250,
                'price_column' => 'J',
                'cost_column' => 'K',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 300,
                'price_column' => 'L',
                'cost_column' => 'M',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 150,
                'price_column' => 'N',
                'cost_column' => 'O',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 180,
                'price_column' => 'P',
                'cost_column' => 'Q',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 220,
                'price_column' => 'R',
                'cost_column' => 'S',
                'row_start' => 60,
                'row_end' => 117,
            ],
            [
                'size_name' => 'B2',
                'width' => 515,
                'height' => 728,
                'paper' => 'Rendezvous',
                'color' => 'Natural',
                'weight' => 210,
                'price_column' => 'T',
                'cost_column' => 'U',
                'row_start' => 60,
                'row_end' => 117,
            ],

            //B3
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 150,
                'price_column' => 'D',
                'cost_column' => 'E',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 180,
                'price_column' => 'F',
                'cost_column' => 'G',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 200,
                'price_column' => 'H',
                'cost_column' => 'I',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 250,
                'price_column' => 'J',
                'cost_column' => 'K',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'Art',
                'color' => 'white',
                'weight' => 300,
                'price_column' => 'L',
                'cost_column' => 'M',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 150,
                'price_column' => 'D',
                'cost_column' => 'E',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 180,
                'price_column' => 'F',
                'cost_column' => 'G',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 200,
                'price_column' => 'H',
                'cost_column' => 'I',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 250,
                'price_column' => 'J',
                'cost_column' => 'K',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'Snow',
                'color' => 'white',
                'weight' => 300,
                'price_column' => 'L',
                'cost_column' => 'M',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 150,
                'price_column' => 'N',
                'cost_column' => 'O',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 180,
                'price_column' => 'P',
                'cost_column' => 'Q',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 220,
                'price_column' => 'R',
                'cost_column' => 'S',
                'row_start' => 117,
                'row_end' => 174,
            ],
            [
                'size_name' => 'B3',
                'width' => 364,
                'height' => 515,
                'paper' => 'Rendezvous',
                'color' => 'Natural',
                'weight' => 210,
                'price_column' => 'T',
                'cost_column' => 'U',
                'row_start' => 117,
                'row_end' => 174,
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

                $printQty = $this->parseNumber($row['B'] ?? '');

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
