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

class PrintCostBookSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = database_path('seeders/data/printing_cost_book.xlsx');
        $spreadsheet = IOFactory::load($filePath);

        $this->printingCost(
            spreadsheet: $spreadsheet,
            sheetName: ' V1350 for single sheets',
            machineType: MachineType::P1350,
            startRowIndex: 2,
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
                    'supplyPriceCol' => 5,
                    'costCol' => 7,
                ],
            ],
            sideType: null,
            isHotDeal: false,
        );

        $this->printingCost(
            spreadsheet: $spreadsheet,
            sheetName: ' V1350 inner use',
            machineType: MachineType::P1350,
            startRowIndex: 5,
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
            sheetName: ' VP140 for single sheets',
            machineType: MachineType::P140,
            startRowIndex: 2,
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
                    'supplyPriceCol' => 5,
                    'costCol' => 7,
                ],
            ],
            sideType: null,
            isHotDeal: false,
        );

        $this->printingCost(
            spreadsheet: $spreadsheet,
            sheetName: ' VP140 inner use',
            machineType: MachineType::P140,
            startRowIndex: 5,
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
