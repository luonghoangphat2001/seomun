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

class FoamBoardFoamexUnitPrice extends Seeder
{

    public function __construct(
        protected AdminPaperService $paperService,
        protected AdminProductService $adminProductService,
    ) {}
    public function run(): void
    {
        $product = Product::where('slug', 'foam-board')->first();
        $this->seedPrices($product);
    }


    private function seedPrices(Product $product): void
    {
        $filePath = database_path('seeders/data/Foam board & Foamex.xlsx');

        $reader = IOFactory::createReaderForFile($filePath);
        $spreadsheet = $reader->load($filePath);

        $sheet = $spreadsheet->getSheetByName(' Price list');

        if (!$sheet) {
            $this->command->error('Sheet " Price list" not found.');
            return;
        }

        $this->processSheet($sheet, $product);
    }

    private function processSheet($sheet, Product $product): void
    {
        $rows = $sheet->toArray(null, true, true, true);

        $subjectMatterColumns = [
            'E' => 'White 5T Foam Board',
            'F' => 'White Foamex 1T',
            'G' => 'White Foamex 2T',
            'H' => 'White Foamex 3T',
            'I' => 'White Foamex 5T',
        ];

        foreach ($rows as $rowNum => $row) {

            // Skip header rows
            $sizeName = trim((string) ($row['A'] ?? ''));

            if ($sizeName === '' || $sizeName === 'standard' || $sizeName === 'Non-standard') {
                continue;
            }

            $width = $this->parseNumber($row['B'] ?? '');
            $height = $this->parseNumber($row['C'] ?? '');

            if ($width <= 0 || $height <= 0) {
                continue;
            }

            $widthMm = (int) round($width * 1000);
            $heightMm = (int) round($height * 1000);

            $erpSizeOption = ErpOption::whereHas('size', function ($query) use (
                $widthMm,
                $heightMm
            ) {
                $query->where('cutting_width', $widthMm)
                    ->where('cutting_height', $heightMm);
            })->first();

            if (!$erpSizeOption) {
                $this->command->warn(
                    "ERP size option not found: {$sizeName} ({$widthMm}x{$heightMm})"
                );

                continue;
            }

            foreach ($subjectMatterColumns as $column => $subjectMatterName) {

                $price = $this->parseNumber($row[$column] ?? '');

                if ($price <= 0) {
                    continue;
                }

                $erpSubjectMasterOption = $this->findSubjectMatterOption(
                    $subjectMatterName
                );

                if (!$erpSubjectMasterOption) {
                    $this->command->warn(
                        "Subject matter option not found: {$subjectMatterName}"
                    );

                    continue;
                }

                $this->createPrice(
                    row: $row,
                    erp_size_option_id: $erpSizeOption->id,
                    erp_paper_option_id: null,
                    erp_subject_master_option_id: $erpSubjectMasterOption->id,
                    product_id: $product->id,
                    priceColumn: $column,
                    costColumn: $column,
                    quantity: 1,
                );
            }
        }
    }

    private function findSubjectMatterOption(string $label): ?ErpOption
    {
        return ErpOption::where('label', $label)->first();
    }
    private function createPrice(
        array $row,
        int $erp_size_option_id,
        ?int $erp_paper_option_id,
        ?int $erp_subject_master_option_id,
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
                'erp_subject_master_option_id' => $erp_subject_master_option_id,
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
                'erp_subject_master_option_id' => $erp_subject_master_option_id,
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

    private function parseNumber(?string $value): float
    {
        if (empty($value)) return 0;
        $value = str_replace(',', '', (string) $value);
        $value = preg_replace('/\s+/', '', $value);
        return (float) $value;
    }
}
