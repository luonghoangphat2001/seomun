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

class DieCutStickerUnitPrice extends Seeder
{

    public function __construct(
        protected AdminPaperService $paperService,
        protected AdminProductService $adminProductService,
    ) {}
    public function run(): void
    {
        $product = Product::where('slug', 'die-cut-sticker')->first();
        $this->seedPrices($product);
    }


    private function seedPrices(Product $product): void
    {
        $filePath = database_path('seeders/data/Die-cut_Stickers (VAT included).xlsx');
        $reader = IOFactory::createReaderForFile($filePath);
        $spreadsheet = $reader->load($filePath);
        $this->processSheet($spreadsheet->getSheetByName(' Art paper (glossy coated, uncoated)'), $product, 'Art paper (glossy coated, uncoated)', 80, 13, 27);
        $this->processSheet($spreadsheet->getSheetByName(' Art paper (matte coated)'), $product, 'Art paper (matte coated)', 80, 13, 27);
        $this->processSheet($spreadsheet->getSheetByName(' Strong adhesive art paper (glossy coated, uncoated)'), $product, 'Strong adhesive art paper (glossy coated, uncoated)', 80, 13, 27);
        $this->processSheet($spreadsheet->getSheetByName(' Special Super Strong Adhesive Art Paper (Glossy Coating)'), $product, 'Special Super Strong Adhesive Art Paper (Glossy Coating)', 80, 13, 27);
        $this->processSheet($spreadsheet->getSheetByName(' Transparent Deadlong'), $product, 'Transparent Deadlong', 80, 28, 41);
        $this->processSheet($spreadsheet->getSheetByName(' Distribution site'), $product, 'Distribution site', 80, 28, 41);
        $this->processSheet($spreadsheet->getSheetByName(' imitation paper'), $product, 'imitation', 80, 28, 41);
        $this->processSheet($spreadsheet->getSheetByName(' Kraft paper'), $product, 'Kraft', 98, 28, 41);
    }

    private function processSheet($sheet, Product $product, string $paper, $weight = 80, $row_start = 13, $row_end = 27): void
    {
        $rows = $sheet->toArray(null, true, true, true);

        $prices = [
            [
                'paper' => $paper,
                'color' => 'white',
                'weight' => $weight,
                'price_column' => 'D',
                'cost_column' => 'E',
                'quantity' => 500,
                'row_start' => $row_start,
                'row_end' => $row_end,
            ],
            [
                'paper' =>  $paper,
                'color' => 'white',
                'weight' => $weight,
                'price_column' => 'F',
                'cost_column' => 'G',
                'quantity' => 1000,
                'row_start' => $row_start,
                'row_end' => $row_end,
            ]
        ];

        foreach ($prices as $config) {


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

                $printQty = $config['quantity'];

                $width = (int) $this->parseNumber(
                    $row['B'] ?? '0'
                );

                $erpSizeOption = ErpOption::whereHas('size', function ($query) use ($width) {
                    $query->where('cutting_width', $width)
                        ->where('cutting_height', $width);
                })->first();

                if (!$erpSizeOption) {
                    $this->command->warn("ERP size option not found: {$width}");
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
