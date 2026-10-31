<?php

namespace Database\Seeders;

use App\Enums\PaperSizeDivisionCode;
use App\Models\Paper;
use App\Models\PaperPrice;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PaperCostSeeder extends Seeder
{

    public function run(): void
    {
        PaperPrice::truncate();
        $filePath = database_path('seeders/data/Paper_Costs.xlsx');
        $spreadsheet = IOFactory::load($filePath);
        $paperPriceSheet = $spreadsheet->getSheetByName('paper');

        $this->processPaperPriceSheet($paperPriceSheet);
    }

    private function processPaperPriceSheet(Worksheet $worksheet): void
    {
        $sizeGroups = [
            [
                'start_col' => 6,
                'sizes' => [
                    PaperSizeDivisionCode::NATIONAL_FULL,
                    PaperSizeDivisionCode::NATIONAL_2,
                    PaperSizeDivisionCode::NATIONAL_4,
                    PaperSizeDivisionCode::NATIONAL_8,
                    PaperSizeDivisionCode::NATIONAL_16,
                ],
            ],
            [
                'start_col' => 16,
                'sizes' => [
                    PaperSizeDivisionCode::SIZE_46_FULL,
                    PaperSizeDivisionCode::SIZE_46_2,
                    PaperSizeDivisionCode::SIZE_46_4,
                    PaperSizeDivisionCode::SIZE_46_8,
                    PaperSizeDivisionCode::SIZE_46_16,
                ],
            ],
            [
                'start_col' => 26,
                'sizes' => [
                    PaperSizeDivisionCode::SMALL_NATIONAL_FULL,
                    PaperSizeDivisionCode::SMALL_NATIONAL_2,
                    PaperSizeDivisionCode::SMALL_NATIONAL_4,
                    PaperSizeDivisionCode::SMALL_NATIONAL_8,
                ],
            ],
        ];

        $papers = Paper::all()->keyBy('name');
        $highestRow = $worksheet->getHighestRow();

        for ($row = 6; $row <= $highestRow; $row++) {

            $paperName = trim((string) $worksheet->getCell("A{$row}")->getValue());

            $paper = $papers->get($paperName);

            if (! $paper) {
                Log::warning("Paper not found", [
                    'paper' => $paperName,
                    'row' => $row,
                ]);
                continue;
            }

            foreach ($sizeGroups as $group) {

                foreach ($group['sizes'] as $index => $paperSize) {
                    $costCol = $group['start_col'] + $index;
                    $supplyCol = $group['start_col'] + $index + 5;

                    $cost = $worksheet
                        ->getCellByColumnAndRow($costCol, $row)
                        ->getCalculatedValue();

                    $supplyPrice = $worksheet
                        ->getCellByColumnAndRow($supplyCol, $row)
                        ->getCalculatedValue();

                    if ($cost === null || $supplyPrice === null || $supplyPrice === '') {
                        continue;
                    }

                    $cost = round((float) $cost / ($index == 0 ? 500 : 1));

                    $supplyPrice = round((float) $supplyPrice / ($index == 0 ? 500 : 1));


                    PaperPrice::create([
                        'paper_id' => $paper->id,
                        'paper_size_division_code' => $paperSize->value,
                        'supply_price' => $supplyPrice,
                        'cost' => $cost,
                        'is_hot_deal' => $worksheet->getTitle() === 'Hot Deal Booklet',
                    ]);
                }
            }
        }
    }

    private function toFloat(?string $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        $normalized = str_replace(['-', ','], '', $value);

        return is_numeric($normalized) ? (float) $normalized : null;
    }
}
