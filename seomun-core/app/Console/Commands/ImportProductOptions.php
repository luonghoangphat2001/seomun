<?php

namespace App\Console\Commands;

use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Models\OrderCodeOptionMapping;
use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportProductOptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:product-options';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import ERP options from data-example.xlsx file';

    /**
     * Get the Excel file path.
     */
    protected function getExcelFilePath(): string
    {
        return 'data-example.xlsx';
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting product option import process...');

        try {
            $excelFilePath = $this->getExcelFilePath();

            // Check if file exists
            if (! file_exists($excelFilePath)) {
                throw new \Exception("Excel file not found: $excelFilePath");
            }

            $this->info('Reading Excel file...');

            // Use PhpSpreadsheet directly to evaluate XLOOKUP formulas in price_min column
            $spreadsheet = IOFactory::load($excelFilePath);
            $sheet = $spreadsheet->getActiveSheet();
            $highestRow = $sheet->getHighestRow();
            $highestCol = $sheet->getHighestColumn();

            $excelData = [];
            for ($rowIndex = 1; $rowIndex <= $highestRow; $rowIndex++) {
                $row = [];
                for ($colIndex = 0; $colIndex <= Coordinate::columnIndexFromString($highestCol) - 1; $colIndex++) {
                    $cell = $sheet->getCellByColumnAndRow($colIndex + 1, $rowIndex);
                    $row[$colIndex] = $cell->getCalculatedValue();
                }
                $excelData[] = $row;
            }

            if (empty($excelData)) {
                throw new \Exception('No data found in Excel file');
            }

            // Skip header row (first row)
            $headerRow = array_shift($excelData);

            $this->info('Processing '.count($excelData).' data rows...');

            $processedProductCodes = [];
            $createdGroups = 0;
            $createdOptions = 0;
            $createdMappings = 0;

            // Collect prices per (product_code, option_code) pair.
            // Same option code can have different prices for different products.
            // Within the same product, prefer the first non-zero price.
            $optionPrices = []; // key: "{productCode}_{optionCode}" => osrc_um
            $optionPricesMin = []; // key: "{productCode}_{optionCode}" => osrc_um_min
            foreach ($excelData as $row) {
                if (empty($row[0]) || empty($row[1]) || empty($row[4]) || empty($row[5])) {
                    continue;
                }
                $productCode = trim($row[0]);
                $optionCode = trim($row[4]);
                $price = $row[6] ?? 0;
                // Sanitize price_min: Excel may return formula strings (e.g. XLOOKUP) instead of numeric values
                $rawMin = $row[7] ?? null;
                $priceMin = (isset($rawMin) && $rawMin !== '' && is_numeric($rawMin)) ? (float) $rawMin : null;
                $key = $productCode.'_'.$optionCode;

                if (! isset($optionPrices[$key])) {
                    $optionPrices[$key] = $price;
                    $optionPricesMin[$key] = $priceMin;
                } elseif ($price > 0 && $optionPrices[$key] == 0) {
                    // Within same product, replace zero with first non-zero price
                    $optionPrices[$key] = $price;
                    $optionPricesMin[$key] = $priceMin;
                }
            }

            // Process rows using per-product prices
            foreach ($excelData as $index => $row) {
                // Skip empty rows
                if (empty($row[0]) || empty($row[1]) || empty($row[4]) || empty($row[5])) {
                    continue;
                }

                $productCode = trim($row[0]);
                $productName = trim($row[1]);
                $processCode = trim($row[2]);
                $optionCategory = trim($row[3]);
                $optionCode = trim($row[4]);
                $optionName = trim($row[5]);
                $price = $optionPrices[$productCode.'_'.$optionCode] ?? 0;
                $priceMin = $optionPricesMin[$productCode.'_'.$optionCode] ?? null;

                // Create or update order code mapping
                if (! isset($processedProductCodes[$productCode])) {
                    $mapping = OrderCodeOptionMapping::firstOrCreate(
                        ['order_code' => $productCode],
                        ['name' => $productName]
                    );

                    if ($mapping->wasRecentlyCreated) {
                        $createdMappings++;
                    }

                    $processedProductCodes[$productCode] = $mapping;
                } else {
                    $mapping = $processedProductCodes[$productCode];
                }

                // Create or update ERP option group
                $erpOptionGroup = ErpOptionGroup::firstOrCreate(
                    ['code' => $processCode],
                    [
                        'label' => $optionCategory,
                        'display_type' => 'select',
                        'is_required' => false,
                        'sort_order' => 0,
                    ]
                );

                if ($erpOptionGroup->wasRecentlyCreated) {
                    $createdGroups++;
                }

                // Create or update ERP option
                $erpOption = ErpOption::firstOrCreate(
                    ['code' => $optionCode],
                    [
                        'erp_option_group_id' => $erpOptionGroup->id,
                        'label' => $optionName,
                        'value' => $optionName,
                        'additional_price' => $price,
                        'osrc_um' => $price,
                        'sort_order' => 0,
                        'is_active' => true,
                    ]
                );

                if ($erpOption->wasRecentlyCreated) {
                    $createdOptions++;
                }

                // Attach ERP option group to order code mapping
                if (! $mapping->erpOptionGroups()->where('erp_option_group_id', $erpOptionGroup->id)->exists()) {
                    $mapping->erpOptionGroups()->attach($erpOptionGroup->id);
                }

                // Attach ERP option to order code mapping with per-product price
                $existing = $mapping->erpOptions()->where('erp_option_id', $erpOption->id)->first();
                if (! $existing) {
                    $mapping->erpOptions()->attach($erpOption->id, [
                        'product_type_condition' => null,
                        'osrc_um' => $price,
                        'osrc_um_min' => $priceMin,
                    ]);
                } else {
                    // Update pivot prices if changed
                    $mapping->erpOptions()->updateExistingPivot($erpOption->id, [
                        'osrc_um' => $price,
                        'osrc_um_min' => $priceMin,
                    ]);
                }
            }

            $this->info('');
            $this->info('Import completed successfully!');
            $this->info('Created mappings: '.$createdMappings);
            $this->info('Created groups: '.$createdGroups);
            $this->info('Created options: '.$createdOptions);
            $this->info('Total product codes processed: '.count($processedProductCodes));

        } catch (\Exception $e) {
            $this->error('Error: '.$e->getMessage());

            return 1;
        }

        return 0;
    }
}
