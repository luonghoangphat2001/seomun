<?php

namespace Database\Seeders;

use App\Enums\BookPrintingSizeType;
use App\Enums\MachineType;
use App\Enums\PrintSideType;
use App\Models\PrintingPrice;
use App\Models\PrintingPriceItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

class PrintCostSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        PrintingPriceItem::truncate();
        PrintingPrice::truncate();
        Schema::enableForeignKeyConstraints();
        $filePath = database_path('seeders/data/Printing_Costs.xlsx');
        $spreadsheet = IOFactory::load($filePath);
        $this->printingCost1350($spreadsheet);
        $this->printingCost140($spreadsheet);
    }

    private function printingCost1350(Spreadsheet $spreadsheet){
        $sheet = $spreadsheet->getSheetByName(' 1350 printing costs');
        $data = $sheet->toArray();

        $machineType = MachineType::P1350;

        $priceDefinitions = [
            ['type' => BookPrintingSizeType::TYPE_A, 'side' => PrintSideType::SINGLE, 'supplyPriceCol' => 1, 'costCol' => 3],
            ['type' => BookPrintingSizeType::TYPE_A, 'side' => PrintSideType::DOUBLE, 'supplyPriceCol' => 5, 'costCol' => 7],
            ['type' => BookPrintingSizeType::TYPE_B, 'side' => PrintSideType::SINGLE, 'supplyPriceCol' => 9, 'costCol' => 11],
            ['type' => BookPrintingSizeType::TYPE_B, 'side' => PrintSideType::DOUBLE, 'supplyPriceCol' => 13, 'costCol' => 15],
            ['type' => BookPrintingSizeType::TYPE_C, 'side' => PrintSideType::SINGLE, 'supplyPriceCol' => 17, 'costCol' => 19],
            ['type' => BookPrintingSizeType::TYPE_C, 'side' => PrintSideType::DOUBLE, 'supplyPriceCol' => 21, 'costCol' => 23],
        ];

        for ($rowIndex = 4; $rowIndex < count($data); $rowIndex++) {
            $row = $data[$rowIndex];

            if (empty($row[0])) {
                continue;
            }

            $quantity = (int) str_replace(',', '', $row[0]);

            foreach ($priceDefinitions as $definition) {
                $supplyPrice = $this->parsePrice($row[$definition['supplyPriceCol']] ?? null);
                $cost = $this->parsePrice($row[$definition['costCol']] ?? null);

                if ($supplyPrice === null && $cost === null) {
                    continue;
                }

                $printingPrice = PrintingPrice::updateOrCreate([
                    'machine_type' => $machineType,
                    'book_printing_size_type' => $definition['type'],
                    'side_type' => $definition['side'],
                    'is_hot_deal' => false,
                ], [
                    'name' => $definition['type']->value . ' - ' . $definition['side']->value,
                    'book_printing_type' => null,
                ]);

                PrintingPriceItem::updateOrCreate([
                    'printing_price_id' => $printingPrice->id,
                    'quantity' => $quantity,
                ], [
                    'supply_price' => $supplyPrice,
                    'cost' => $cost,
                ]);
            }
        }
    }

    private function printingCost140(Spreadsheet $spreadsheet)
    {
        $sheet140 = $spreadsheet->getSheetByName(' 140 printing cost');
        if ($sheet140) {
            $data140 = $sheet140->toArray();
            $machineType140 = MachineType::P140;

            $priceDefinitions140 = [
                ['side' => PrintSideType::SINGLE, 'supplyPriceCol' => 1, 'costCol' => 3],
                ['side' => PrintSideType::DOUBLE, 'supplyPriceCol' => 5, 'costCol' => 7],
            ];

            for ($rowIndex = 2; $rowIndex < count($data140); $rowIndex++) {
                $row = $data140[$rowIndex];

                if (empty($row[0])) {
                    continue;
                }

                $quantity = (int) str_replace(',', '', $row[0]);

                foreach ($priceDefinitions140 as $definition) {
                    $supplyPrice = $this->parsePrice($row[$definition['supplyPriceCol']] ?? null);
                    $cost = $this->parsePrice($row[$definition['costCol']] ?? null);

                    if ($supplyPrice === null && $cost === null) {
                        continue;
                    }

                    $printingPrice = PrintingPrice::updateOrCreate([
                        'machine_type' => $machineType140,
                        'book_printing_size_type' => null,
                        'side_type' => $definition['side'],
                        'is_hot_deal' => false,
                    ], [
                        'name' => $definition['side']->value,
                        'book_printing_type' => null,
                    ]);

                    PrintingPriceItem::updateOrCreate([
                        'printing_price_id' => $printingPrice->id,
                        'quantity' => $quantity,
                    ], [
                        'supply_price' => $supplyPrice,
                        'cost' => $cost,
                    ]);
                }
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
