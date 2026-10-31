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

class ColorEnvelopeUnitPrice extends Seeder
{

    public function __construct(
        protected AdminPaperService $paperService,
        protected AdminProductService $adminProductService,
    ) {}
    public function run(): void
    {
        $product = Product::where('slug', 'color-envelope')->first();
        $this->seedPrices($product);
    }


    private function seedPrices(Product $product): void
    {
        $filePath = database_path('seeders/data/envelope.xlsx');
        $reader = IOFactory::createReaderForFile($filePath);
        $spreadsheet = $reader->load($filePath);
        $this->processSheet($spreadsheet->getSheetByName(' collar'), $product);
    }

    private function processSheet($sheet, Product $product): void
    {
        $rows = $sheet->toArray(null, true, true, true);

        $prices = [
            // A4 standard envelope (220x105) - 4 items
            [
                'size_name' => '220x105',
                'width' => 220,
                'height' => 105,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 100,
                'price_column' => 'C',
                'cost_column' => 'D',
                'row_start' => 5,
                'row_end' => 15,
            ],
            [
                'size_name' => '220x105',
                'width' => 220,
                'height' => 105,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 120,
                'price_column' => 'E',
                'cost_column' => 'F',
                'row_start' => 5,
                'row_end' => 15,
            ],
            [
                'size_name' => '220x105',
                'width' => 220,
                'height' => 105,
                'paper' => 'Checked leather',
                'color' => 'white',
                'weight' => 110,
                'price_column' => 'G',
                'cost_column' => 'H',
                'row_start' => 5,
                'row_end' => 15,
            ],
            [
                'size_name' => '220x105',
                'width' => 220,
                'height' => 105,
                'paper' => 'Julezak',
                'color' => 'white',
                'weight' => 110,
                'price_column' => 'I',
                'cost_column' => 'J',
                'row_start' => 5,
                'row_end' => 15,
            ],

            // K = Post-processing double-sided tape

            // Jacket envelope (160x80) - 3 items
            [
                'size_name' => '160x80',
                'width' => 160,
                'height' => 80,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 100,
                'price_column' => 'L',
                'cost_column' => 'M',
                'row_start' => 5,
                'row_end' => 15,
            ],
            [
                'size_name' => '160x80',
                'width' => 160,
                'height' => 80,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 120,
                'price_column' => 'N',
                'cost_column' => 'O',
                'row_start' => 5,
                'row_end' => 15,
            ],
            [
                'size_name' => '160x80',
                'width' => 160,
                'height' => 80,
                'paper' => 'Checked leather',
                'color' => 'white',
                'weight' => 110,
                'price_column' => 'P',
                'cost_column' => 'Q',
                'row_start' => 5,
                'row_end' => 15,
            ],

            // Jacket envelope (173x88) - 3 items
            [
                'size_name' => '173x88',
                'width' => 173,
                'height' => 88,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 100,
                'price_column' => 'R',
                'cost_column' => 'S',
                'row_start' => 5,
                'row_end' => 15,
            ],
            [
                'size_name' => '173x88',
                'width' => 173,
                'height' => 88,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 120,
                'price_column' => 'T',
                'cost_column' => 'U',
                'row_start' => 5,
                'row_end' => 15,
            ],
            [
                'size_name' => '173x88',
                'width' => 173,
                'height' => 88,
                'paper' => 'Checked leather',
                'color' => 'white',
                'weight' => 110,
                'price_column' => 'V',
                'cost_column' => 'W',
                'row_start' => 5,
                'row_end' => 15,
            ],

            // Jacket envelope (180x120) - 2 items
            [
                'size_name' => '180x120',
                'width' => 180,
                'height' => 120,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 100,
                'price_column' => 'X',
                'cost_column' => 'Y',
                'row_start' => 5,
                'row_end' => 15,
            ],
            [
                'size_name' => '180x120',
                'width' => 180,
                'height' => 120,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 120,
                'price_column' => 'Z',
                'cost_column' => 'AA',
                'row_start' => 5,
                'row_end' => 15,
            ],

            // Square envelope (195x135) - 2 items
            [
                'size_name' => '195x135',
                'width' => 195,
                'height' => 135,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 100,
                'price_column' => 'AB',
                'cost_column' => 'AC',
                'row_start' => 5,
                'row_end' => 15,
            ],
            [
                'size_name' => '195x135',
                'width' => 195,
                'height' => 135,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 120,
                'price_column' => 'AD',
                'cost_column' => 'AE',
                'row_start' => 5,
                'row_end' => 15,
            ],

            // No. 1 (5-section) Envelope (330x245) - 3 items
            [
                'size_name' => '330x245',
                'width' => 330,
                'height' => 245,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 120,
                'price_column' => 'AF',
                'cost_column' => 'AG',
                'row_start' => 5,
                'row_end' => 15,
            ],
            [
                'size_name' => '330x245',
                'width' => 330,
                'height' => 245,
                'paper' => 'Checked leather',
                'color' => 'white',
                'weight' => 110,
                'price_column' => 'AH',
                'cost_column' => 'AI',
                'row_start' => 5,
                'row_end' => 15,
            ],
            [
                'size_name' => '330x245',
                'width' => 330,
                'height' => 245,
                'paper' => 'Julezak',
                'color' => 'white',
                'weight' => 110,
                'price_column' => 'AJ',
                'cost_column' => 'AK',
                'row_start' => 5,
                'row_end' => 15,
            ],

            // AL = Post-processing double-sided tape

            // Size 3 (9-fold) Envelope (260x190) - 1 item
            [
                'size_name' => '260x190',
                'width' => 260,
                'height' => 190,
                'paper' => 'imitation',
                'color' => 'white',
                'weight' => 120,
                'price_column' => 'AM',
                'cost_column' => 'AN',
                'row_start' => 5,
                'row_end' => 15,
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
