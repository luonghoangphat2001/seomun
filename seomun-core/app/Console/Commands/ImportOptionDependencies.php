<?php

namespace App\Console\Commands;

use App\Models\ErpOption;
use App\Models\ErpOptionDependency;
use App\Models\ErpOptionGroup;
use App\Models\OrderCodeOptionMapping;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class ImportOptionDependencies extends Command
{
    protected $signature = 'import:option-dependencies {file? : Excel file path}';

    protected $description = 'Import option dependencies from Excel file (소재에 따른 옵션코드.xlsx)';

    public function handle()
    {
        $filePath = $this->argument('file') ?? '소재에 따른 옵션코드.xlsx';

        $this->info("Starting option dependency import from: $filePath");

        if (! file_exists($filePath)) {
            $this->error("File not found: $filePath");

            return 1;
        }

        $data = Excel::toArray([], $filePath);

        if (empty($data) || empty($data[0])) {
            $this->error('No data found in Excel file');

            return 1;
        }

        $excelData = $data[0];

        // Skip header row
        $headerRow = array_shift($excelData);

        $this->info('Processing '.count($excelData).' rows...');

        $createdCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;

        // Get all option groups
        $optionGroups = ErpOptionGroup::all()->keyBy('code');

        // Get all options
        $options = ErpOption::all()->keyBy('code');

        // Column indices based on the Excel structure (0-indexed)
        // Column I (index 8): 옵션코드 (Option Code) - e.g., 90301
        // Column K (index 10): 제품코드 (Product Code) - e.g., 9403
        // Column M-R (index 12-17): 잉크 (Ink/OP904) - up to 6 options
        // Column S-AC (index 18-28): 합지 (Lamination/OP905) - up to 11 options
        // Column AD-AE (index 29-30): 코팅 (Coating/OP906) - up to 2 options
        // Column AF-AI (index 31-34): 재단 (Cutting/OP907) - up to 4 options
        // Column AJ-AK (index 35-36): 기본후가공 (Basic Processing/OP908) - up to 2 options
        // Column AL-AM (index 37-38): 추가후가공 (Additional Processing/OP909) - up to 2 options
        // Column AN-AY (index 39-50): 추가물품 (Additional Items/OP910) - up to 12 options
        // Column AZ (index 51): 포장 (Packaging/OP911) - 1 option

        foreach ($excelData as $index => $row) {
            // Skip empty rows
            if (empty($row[8]) || empty($row[10])) { // 옵션코드, 제품코드
                continue;
            }

            $optionCode = trim($row[8]);  // 옵션코드 (option code) - Column I
            $orderCode = trim($row[10]);  // 제품코드 (product code) - Column K

            // Find the material option
            $materialOption = ErpOption::where('code', $optionCode)->first();

            if (! $materialOption) {
                $skippedCount++;

                continue;
            }

            // Get option group ID for material (should be OP903)
            $materialGroupId = $materialOption->erp_option_group_id;

            // Process Ink options (columns M-R = index 12-17) - up to 6 options
            $inkCodes = array_filter(array_slice($row, 12, 6));
            $forceCreateInk = (in_array($orderCode, ['2008', '9103']));
            if ((! empty($inkCodes) || $forceCreateInk) && isset($optionGroups['OP904'])) {
                $this->createDependency(
                    $orderCode,
                    $materialGroupId,
                    $materialOption->id,
                    $optionGroups['OP904']->id,
                    $inkCodes,
                    $options,
                    $optionGroups,
                    $forceCreateInk
                );
                $createdCount++;
            }

            // Process Lamination options (columns S-AC = index 18-28) - up to 11 options
            $lamCodes = array_filter(array_slice($row, 18, 11));

            // For 2008: always create dependency (will hide if empty)
            // For 9103: create dependency if Excel has OP905 values OR if we need to handle special hiding case
            $forceCreateLam = ($orderCode === '2008' || $orderCode === '9301');
            $shouldProcessLamFor9103 = ($orderCode === '9103' && isset($optionGroups['OP905']));

            if ((! empty($lamCodes) || $shouldProcessLamFor9103 || $forceCreateLam) && isset($optionGroups['OP905'])) {
                $this->createDependency(
                    $orderCode,
                    $materialGroupId,
                    $materialOption->id,
                    $optionGroups['OP905']->id,
                    $lamCodes,
                    $options,
                    $optionGroups,
                    $forceCreateLam
                );
                $createdCount++;
            }

            // Process Coating options (columns AD-AE = index 29-30) - up to 2 options
            $coatingCodes = array_filter(array_slice($row, 29, 2));
            $forceCreateCoating = (in_array($orderCode, ['2008', '9103', '9301']));
            if ((! empty($coatingCodes) || $forceCreateCoating) && isset($optionGroups['OP906'])) {
                $this->createDependency(
                    $orderCode,
                    $materialGroupId,
                    $materialOption->id,
                    $optionGroups['OP906']->id,
                    $coatingCodes,
                    $options,
                    $optionGroups,
                    $forceCreateCoating
                );
                $createdCount++;
            }

            // Process Cutting options (columns AF-AI = index 31-34) - up to 4 options
            $cuttingCodes = array_filter(array_slice($row, 31, 4));
            $forceCreateCutting = (in_array($orderCode, ['2008', '9103']));
            if ((! empty($cuttingCodes) || $forceCreateCutting) && isset($optionGroups['OP907'])) {
                $this->createDependency(
                    $orderCode,
                    $materialGroupId,
                    $materialOption->id,
                    $optionGroups['OP907']->id,
                    $cuttingCodes,
                    $options,
                    $optionGroups,
                    $forceCreateCutting
                );
                $createdCount++;
            }

            // Process Basic Processing options (columns AJ-AK = index 35-36) - up to 2 options
            $basicProcessCodes = array_filter(array_slice($row, 35, 2));
            $forceCreateBasic = (in_array($orderCode, ['2008', '9103']));
            if ((! empty($basicProcessCodes) || $forceCreateBasic) && isset($optionGroups['OP908'])) {
                $this->createDependency(
                    $orderCode,
                    $materialGroupId,
                    $materialOption->id,
                    $optionGroups['OP908']->id,
                    $basicProcessCodes,
                    $options,
                    $optionGroups,
                    $forceCreateBasic
                );
                $createdCount++;
            }

            // Process Additional Processing options (column AL-AM = index 37-38) - up to 2 options
            $processCodes = array_filter(array_slice($row, 37, 2));
            $forceCreateAdditional = (in_array($orderCode, ['2008', '9103']));
            if ((! empty($processCodes) || $forceCreateAdditional) && isset($optionGroups['OP909'])) {
                $this->createDependency(
                    $orderCode,
                    $materialGroupId,
                    $materialOption->id,
                    $optionGroups['OP909']->id,
                    $processCodes,
                    $options,
                    $optionGroups,
                    $forceCreateAdditional
                );
                $createdCount++;
            }

            // Process Additional Items options (columns AN-AY = index 39-50) - up to 12 options
            $additionalItemCodes = array_filter(array_slice($row, 39, 12));
            $forceCreateItems = (in_array($orderCode, ['2008', '9103']));
            if ((! empty($additionalItemCodes) || $forceCreateItems) && isset($optionGroups['OP910'])) {
                $this->createDependency(
                    $orderCode,
                    $materialGroupId,
                    $materialOption->id,
                    $optionGroups['OP910']->id,
                    $additionalItemCodes,
                    $options,
                    $optionGroups,
                    $forceCreateItems
                );
                $createdCount++;
            }

            // Process Packaging options (column AZ = index 51) - 1 option
            $packagingCodes = array_filter(array_slice($row, 51, 1));
            $forceCreatePackaging = (in_array($orderCode, ['2008', '9103']));
            if ((! empty($packagingCodes) || $forceCreatePackaging) && isset($optionGroups['OP911'])) {
                $this->createDependency(
                    $orderCode,
                    $materialGroupId,
                    $materialOption->id,
                    $optionGroups['OP911']->id,
                    $packagingCodes,
                    $options,
                    $optionGroups,
                    $forceCreatePackaging
                );
                $createdCount++;
            }
        }

        $this->info('');
        $this->info('Import completed!');
        $this->info("Created/Updated dependencies: $createdCount");
        $this->info("Skipped: $skippedCount");

        return 0;
    }

    /**
     * Create or update option dependency
     *
     * @param  string  $orderCode  Product order code
     * @param  int  $triggerGroupId  Trigger option group ID (e.g., OP903 for materials)
     * @param  int  $triggerOptionId  Trigger option ID (the selected option)
     * @param  int|null  $affectedGroupId  Affected option group ID
     * @param  array  $allowedOptionCodes  Array of allowed option codes
     * @param  Collection  $optionsCollection  Collection of all options
     * @param  mixed  $optionGroups  Array or Collection of option groups keyed by code
     * @param  bool  $forceCreate  Force create dependency even if empty (for ordercode 2008)
     */
    protected function createDependency(
        string $orderCode,
        int $triggerGroupId,
        int $triggerOptionId,
        ?int $affectedGroupId,
        array $allowedOptionCodes,
        $optionsCollection,
        $optionGroups = [],
        bool $forceCreate = false
    ): void {
        if (! $affectedGroupId) {
            return;
        }

        // Special handling for 9103: 폼보드 and 포맥스 materials should NOT show OP905 (lamination)
        // When Excel has no OP905 values (empty lamCodes) for 9103, we should hide OP905
        // But we should NOT create dependency if forceCreate is false and no valid options exist
        $shouldHide = false;

        // Check if this is 9103 + OP905 case
        if ($orderCode === '9103' && isset($optionGroups['OP905']) && $affectedGroupId === $optionGroups['OP905']->id) {
            // Get the material option to check its name
            $materialOption = ErpOption::find($triggerOptionId);
            if ($materialOption && $materialOption->label) {
                // Check if material label contains 폼보드 or 포맥스
                if (str_contains($materialOption->label, '폼보드') || str_contains($materialOption->label, '포맥스')) {
                    $shouldHide = true;
                    $this->info("Special case: Hiding OP905 for material: {$materialOption->label} (ID: $triggerOptionId)");
                }
            }

            // Also check if Excel has no OP905 values (for other materials)
            // If Excel is empty AND material is not 폼보드/포맥스, still show OP905
            // If Excel is empty AND material IS 폼보드/포맥스, hide OP905
            $hasExcelValues = ! empty(array_filter($allowedOptionCodes));
            if (! $hasExcelValues && ! $shouldHide) {
                // Excel has no OP905 values but material is not 폼보드/포맥스
                // This means we should NOT create dependency for now (let it show all options)
                // Only create if forceCreate is true
                if (! $forceCreate) {
                    return;
                }
            }
        }

        // Convert option codes to option IDs
        $allowedOptionIds = [];

        if (! $shouldHide) {
            // Normal case: add allowed options
            foreach ($allowedOptionCodes as $code) {
                $code = trim($code);
                if (! empty($code) && isset($optionsCollection[$code])) {
                    $allowedOptionIds[] = $optionsCollection[$code]->id;
                }
            }
        }
        // If shouldHide is true, allowedOptionIds stays empty (meaning hide all options)

        if (empty($allowedOptionIds) && ! $shouldHide && ! $forceCreate) {
            return;
        }

        // Find or create dependency
        $dependency = ErpOptionDependency::where('order_code', $orderCode)
            ->where('trigger_option_group_id', $triggerGroupId)
            ->where('trigger_option_id', $triggerOptionId)
            ->where('affected_option_group_id', $affectedGroupId)
            ->first();

        if ($dependency) {
            $dependency->update([
                'allowed_options' => $allowedOptionIds,
            ]);
        } else {
            ErpOptionDependency::create([
                'order_code' => $orderCode,
                'trigger_option_group_id' => $triggerGroupId,
                'trigger_option_id' => $triggerOptionId,
                'affected_option_group_id' => $affectedGroupId,
                'allowed_options' => $allowedOptionIds,
            ]);
        }

        if ($shouldHide || ($forceCreate && empty($allowedOptionIds))) {
            $this->info("Created HIDE rule for order $orderCode, material $triggerOptionId -> group $affectedGroupId");
        }

        // Sync allowed options into order_code_erp_option mapping
        // so the options are visible in the available-options API response
        if (! empty($allowedOptionIds)) {
            $this->syncOptionMapping($orderCode, $allowedOptionIds);
        }
    }

    /**
     * Ensure the given option IDs are mapped to the order code in order_code_erp_option.
     * Only inserts missing rows — never deletes existing ones.
     */
    protected function syncOptionMapping(string $orderCode, array $optionIds): void
    {
        $mapping = OrderCodeOptionMapping::where('order_code', $orderCode)->first();

        if (! $mapping) {
            return;
        }

        $existing = DB::table('order_code_erp_option')
            ->where('order_code_id', $mapping->id)
            ->whereIn('erp_option_id', $optionIds)
            ->pluck('erp_option_id')
            ->toArray();

        $toInsert = array_diff($optionIds, $existing);

        foreach ($toInsert as $optionId) {
            DB::table('order_code_erp_option')->insert([
                'order_code_id' => $mapping->id,
                'erp_option_id' => $optionId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
