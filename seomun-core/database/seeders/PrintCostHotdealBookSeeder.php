<?php

namespace Database\Seeders;

use App\Enums\BookPrintingSizeType;
use App\Enums\BookPrintingType;
use App\Enums\MachineType;
use App\Enums\PrintSideType;
use App\Models\PrintingPrice;
use App\Models\PrintingPriceItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

class PrintCostHotdealBookSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = database_path('seeders/data/cost_booket_hotdeal.xlsx');
        $spreadsheet = IOFactory::load($filePath);

        $this->printingCost(
            spreadsheet: $spreadsheet,
            sheetName: ' Hot deal booklet cover 1350 pr',
            machineType: MachineType::P1350,
            startRowIndex: 4,
            quantityCol: 0,
            priceDefinitions: [
                [
                    'type' => BookPrintingSizeType::NATION4,
                    'book_printing_type' => BookPrintingType::BOOKLET_COVER,
                    'supplyPriceCol' => 1,
                    'costCol' => 3,
                ],
                [
                    'type' => BookPrintingSizeType::NATION8,
                    'book_printing_type' => BookPrintingType::BOOKLET_COVER,
                    'supplyPriceCol' => 9,
                    'costCol' => 11,
                ],
            ],
            sideType: null,
            isHotDeal: true,
        );

        $this->printingCost(
            spreadsheet: $spreadsheet,
            sheetName: ' Hot deal booklet inner pages 1',
            machineType: MachineType::P1350,
            startRowIndex: 3,
            quantityCol: 0,
            priceDefinitions: [
                [
                    'type' => BookPrintingSizeType::NATION8,
                    'book_printing_type' => BookPrintingType::BOOKLET_INNER,
                    'supplyPriceCol' => 1,
                    'costCol' => 4,
                ],
                [
                    'type' => BookPrintingSizeType::NATION16,
                    'book_printing_type' => BookPrintingType::BOOKLET_INNER,
                    'supplyPriceCol' => 7,
                    'costCol' => 10,
                ],
            ],
            sideType: null,
            isHotDeal: false,
        );

        $this->printingCost(
            spreadsheet: $spreadsheet,
            sheetName: ' Hot deal booklet inner pages-1',
            machineType: MachineType::P1350,
            startRowIndex: 3,
            quantityCol: 0,
            priceDefinitions: [
                [
                    'type' => BookPrintingSizeType::NATION8,
                    'book_printing_type' => BookPrintingType::BOOKLET_INNER,
                    'supplyPriceCol' => 1,
                    'costCol' => 4,
                ],
                [
                    'type' => BookPrintingSizeType::NATION16,
                    'book_printing_type' => BookPrintingType::BOOKLET_INNER,
                    'supplyPriceCol' => 7,
                    'costCol' => 10,
                ],
            ],
            sideType: null,
            isHotDeal: true,
        );
    }

    private function printingCost(
        Spreadsheet $spreadsheet,
        string $sheetName,
        MachineType $machineType,
        int $startRowIndex,
        int $quantityCol,
        array $priceDefinitions,
        ?string $sideType = null,
        bool $isHotDeal = false,
    ): void {
        $sheet = $spreadsheet->getSheetByName($sheetName);
        $data = $sheet->toArray();

        $printingPrices = [];

        for ($rowIndex = $startRowIndex; $rowIndex < count($data); $rowIndex++) {
            $row = $data[$rowIndex];

            if (empty($row[$quantityCol])) {
                continue;
            }

            $quantity = (int) str_replace(',', '', $row[$quantityCol]);

            foreach ($priceDefinitions as $definition) {
                $supplyPrice = $this->parsePrice(
                    $row[$definition['supplyPriceCol']] ?? null
                );

                $cost = $this->parsePrice(
                    $row[$definition['costCol']] ?? null
                );

                if ($supplyPrice === null && $cost === null) {
                    continue;
                }

                // $this->command->warn(
                //     'Processing price: ' . json_encode([
                //         'machine_type' => $machineType->value,
                //         'book_printing_size_type' => $definition['type']->value,
                //         'side_type' => $sideType,
                //         'book_printing_type' => $definition['book_printing_type']->value,
                //         'is_hot_deal' => $isHotDeal,
                //         'quantity' => $quantity,
                //         'supply_price' => $supplyPrice,
                //         'cost' => $cost,
                //     ], JSON_UNESCAPED_UNICODE)
                // );

                $typeKey = $definition['type']->value;
                if (!isset($printingPrices[$typeKey])) {
                    $printingPrices[$typeKey] = PrintingPrice::firstOrCreate(
                        [
                            'machine_type' => $machineType,
                            'book_printing_size_type' => $definition['type'],
                            'side_type' => $sideType,
                            'book_printing_type' => $definition['book_printing_type'],
                            'is_hot_deal' => $isHotDeal,
                        ],
                        [
                            'name' => $definition['type']->value . ' for single sheets',
                        ]
                    );
                }

                PrintingPriceItem::updateOrCreate(
                    [
                        'printing_price_id' => $printingPrices[$typeKey]->id,
                        'quantity' => $quantity,
                    ],
                    [
                        'supply_price' => $supplyPrice,
                        'cost' => $cost,
                    ]
                );
            }
        }
    }

    private function parsePrice(?string $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        $normalized = str_replace(',', '', trim($value));

        return $normalized === '' ? null : (float) $normalized;
    }
}
