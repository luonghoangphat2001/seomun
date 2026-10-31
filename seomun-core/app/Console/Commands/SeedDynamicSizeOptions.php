<?php

namespace App\Console\Commands;

use App\Models\ErpOption;
use App\Models\SizeOption;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SeedDynamicSizeOptions extends Command
{
    protected $signature = 'seed:dynamic-size-options {--dry-run : Show what would be seeded without actually seeding} {--fresh : Truncate table before seeding (start fresh)}';

    protected $description = 'Seed dynamic size options based on old system arrSize1 and arrSize2 data';

    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $fresh = $this->option('fresh');

        $this->info('Seeding dynamic size options...');

        // If --fresh option is provided, truncate the table first
        if ($fresh && ! $dryRun) {
            SizeOption::truncate();
            $this->info('Truncated erp_size_options table - will seed from scratch');
        }

        // Get valid order codes from order_code_option_mappings
        $validOrderCodes = DB::table('order_code_option_mappings')
            ->distinct()
            ->pluck('order_code')
            ->toArray();

        $this->info('Valid order codes: '.implode(', ', $validOrderCodes));

        // Define dynamic size data from old system (order_02_var.js)
        $dynamicSizes = $this->getDynamicSizeData();

        // Filter sizes to only include valid order codes
        $filteredSizes = array_filter($dynamicSizes, function ($size) use ($validOrderCodes) {
            return in_array($size['order_code'], $validOrderCodes);
        });

        // Always include fixed flying banner sizes even if the order code mapping isn't present yet
        $filteredSizes = array_merge(
            $filteredSizes,
            $this->generateSizesFor5105(),
            $this->generateSizesFor5106()
        );

        $this->info('Filtered to '.count($filteredSizes).' sizes (from valid order codes)');

        $seeded = 0;
        $skipped = 0;

        foreach ($filteredSizes as $data) {
            // Match by order_code + name (the unique key) — covers dimension changes too
            $existingSize = SizeOption::where('order_code', $data['order_code'])
                ->where('name', $data['name'])
                ->first();

            // If no exact match, check if there's a free input record for this order code
            // This handles cases like 9405 where "자유입력" (free input) should be replaced with fixed size "퀵배너B-H"
            if (! $existingSize) {
                $freeInputRecord = SizeOption::where('order_code', $data['order_code'])
                    ->whereIn('name', ['자유입력', 'Free Input', 'Custom Size'])
                    ->first();

                if ($freeInputRecord) {
                    // Replace the free input record with the fixed size
                    $existingSize = $freeInputRecord;
                }
            }

            if ($existingSize) {
                // Update existing with name, additional widths/heights and custom input fields
                $updateData = [
                    'name' => $data['name'], // Update name (e.g., from "자유입력" to "퀵배너B-H")
                    'working_width' => $data['working_width'],
                    'working_height' => $data['working_height'],
                    'additional_widths' => json_encode($data['additional_widths']),
                    'additional_heights' => json_encode($data['additional_heights']),
                ];

                $isFlyingBanner = in_array($data['order_code'], ['5105', '5106'], true);
                if ($isFlyingBanner) {
                    $updateData['cutting_width'] = $data['working_width'];
                    $updateData['cutting_height'] = $data['working_height'];
                }

                // Update ERP option link & default flag when present
                if (array_key_exists('erp_option_id', $data)) {
                    $updateData['erp_option_id'] = $data['erp_option_id'];
                }
                if (array_key_exists('is_default', $data)) {
                    $updateData['is_default'] = $data['is_default'];
                }

                // Update custom input fields if present
                if (isset($data['is_custom_input_allowed'])) {
                    $updateData['is_custom_input_allowed'] = $data['is_custom_input_allowed'];
                }
                if (isset($data['min_width'])) {
                    $updateData['min_width'] = $data['min_width'];
                }
                if (isset($data['max_width'])) {
                    $updateData['max_width'] = $data['max_width'];
                }
                if (isset($data['min_height'])) {
                    $updateData['min_height'] = $data['min_height'];
                }
                if (isset($data['max_height'])) {
                    $updateData['max_height'] = $data['max_height'];
                }
                if (isset($data['width_step'])) {
                    $updateData['width_step'] = $data['width_step'];
                }
                if (isset($data['height_step'])) {
                    $updateData['height_step'] = $data['height_step'];
                }

                if ($dryRun) {
                    $this->line("Would update: {$data['name']} ({$data['working_width']}x{$data['working_height']})");
                } else {
                    $existingSize->update($updateData);
                    $this->line("Updated: {$data['name']} ({$data['working_width']}x{$data['working_height']})");
                }
                $seeded++;
            } else {
                // Create new size option with erp_option_id
                $erpOptionId = array_key_exists('erp_option_id', $data)
                    ? $data['erp_option_id']
                    : $this->findErpOptionId($data['order_code'], $data['name']);

                if ($dryRun) {
                    $this->line("Would create: {$data['name']} ({$data['working_width']}x{$data['working_height']}) [ERP Option: {$erpOptionId}]");
                } else {
                    $isFlyingBanner = in_array($data['order_code'], ['5105', '5106'], true);
                    $createData = [
                        'order_code' => $data['order_code'],
                        'name' => $data['name'],
                        'cutting_width' => $isFlyingBanner ? $data['working_width'] : ($data['working_width'] + 50),
                        'cutting_height' => $isFlyingBanner ? $data['working_height'] : ($data['working_height'] + 50),
                        'working_width' => $data['working_width'],
                        'working_height' => $data['working_height'],
                        'additional_widths' => json_encode($data['additional_widths']),
                        'additional_heights' => json_encode($data['additional_heights']),
                        'is_default' => $data['is_default'] ?? false,
                        'erp_option_id' => $erpOptionId,
                    ];

                    // Add custom input fields if present (for FREE INPUT products like 2009)
                    if (isset($data['is_custom_input_allowed'])) {
                        $createData['is_custom_input_allowed'] = $data['is_custom_input_allowed'];
                    }
                    if (isset($data['min_width'])) {
                        $createData['min_width'] = $data['min_width'];
                    }
                    if (isset($data['max_width'])) {
                        $createData['max_width'] = $data['max_width'];
                    }
                    if (isset($data['min_height'])) {
                        $createData['min_height'] = $data['min_height'];
                    }
                    if (isset($data['max_height'])) {
                        $createData['max_height'] = $data['max_height'];
                    }
                    if (isset($data['width_step'])) {
                        $createData['width_step'] = $data['width_step'];
                    }
                    if (isset($data['height_step'])) {
                        $createData['height_step'] = $data['height_step'];
                    }

                    SizeOption::create($createData);
                    $this->line("Created: {$data['name']} ({$data['working_width']}x{$data['working_height']}) [ERP Option: {$erpOptionId}]");
                }
                $seeded++;
            }
        }

        $this->info("Processed {$seeded} size options.");

        return 0;
    }

    private function generateSizesFor5105(): array
    {
        $sizes = [];

        $erpOptionIdMap = [
            '대-물통' => 53,
            '대-크로스' => 54,
            '대-사각' => 55,
            '대-스파이크' => 56,
            '중-물통' => 57,
            '중-크로스' => 58,
            '중-사각' => 59,
            '중-스파이크' => 60,
            '소-물통' => 61,
            '소-크로스' => 62,
            '소-사각' => 63,
            '소-스파이크' => 64,
        ];

        $definitions = [
            ['key' => '대-물통', 'w' => 800, 'h' => 3800, 'is_default' => true],
            ['key' => '대-크로스', 'w' => 800, 'h' => 3800, 'is_default' => false],
            ['key' => '대-사각', 'w' => 800, 'h' => 3800, 'is_default' => false],
            ['key' => '대-스파이크', 'w' => 800, 'h' => 3800, 'is_default' => false],
            ['key' => '중-물통', 'w' => 700, 'h' => 3000, 'is_default' => false],
            ['key' => '중-크로스', 'w' => 700, 'h' => 3000, 'is_default' => false],
            ['key' => '중-사각', 'w' => 700, 'h' => 3000, 'is_default' => false],
            ['key' => '중-스파이크', 'w' => 700, 'h' => 3000, 'is_default' => false],
            ['key' => '소-물통', 'w' => 650, 'h' => 1950, 'is_default' => false],
            ['key' => '소-크로스', 'w' => 650, 'h' => 1950, 'is_default' => false],
            ['key' => '소-사각', 'w' => 650, 'h' => 1950, 'is_default' => false],
            ['key' => '소-스파이크', 'w' => 650, 'h' => 1950, 'is_default' => false],
        ];

        foreach ($definitions as $def) {
            $sizes[] = [
                'order_code' => '5105',
                'name' => '플라잉배너S형('.$def['key'].')',
                'working_width' => $def['w'],
                'working_height' => $def['h'],
                'additional_widths' => [],
                'additional_heights' => [],
                'is_default' => $def['is_default'],
                'erp_option_id' => $erpOptionIdMap[$def['key']] ?? null,
            ];
        }

        return $sizes;
    }

    private function generateSizesFor5106(): array
    {
        $sizes = [];

        $erpOptionIdMap = [
            '대-물통' => 66,
            '대-크로스' => 67,
            '대-사각' => 68,
            '대-스파이크' => 69,
            '중-물통' => 70,
            '중-크로스' => 71,
            '중-사각' => 72,
            '중-스파이크' => 73,
            '소-물통' => 74,
            '소-크로스' => 75,
            '소-사각' => 76,
            '소-스파이크' => 77,
        ];

        $definitions = [
            ['key' => '대-물통', 'w' => 1100, 'h' => 3800, 'is_default' => true],
            ['key' => '대-크로스', 'w' => 1100, 'h' => 3800, 'is_default' => false],
            ['key' => '대-사각', 'w' => 1100, 'h' => 3800, 'is_default' => false],
            ['key' => '대-스파이크', 'w' => 1100, 'h' => 3800, 'is_default' => false],
            ['key' => '중-물통', 'w' => 1050, 'h' => 2700, 'is_default' => false],
            ['key' => '중-크로스', 'w' => 1050, 'h' => 2700, 'is_default' => false],
            ['key' => '중-사각', 'w' => 1050, 'h' => 2700, 'is_default' => false],
            ['key' => '중-스파이크', 'w' => 1050, 'h' => 2700, 'is_default' => false],
            ['key' => '소-물통', 'w' => 760, 'h' => 1800, 'is_default' => false],
            ['key' => '소-크로스', 'w' => 760, 'h' => 1800, 'is_default' => false],
            ['key' => '소-사각', 'w' => 760, 'h' => 1800, 'is_default' => false],
            ['key' => '소-스파이크', 'w' => 760, 'h' => 1800, 'is_default' => false],
        ];

        foreach ($definitions as $def) {
            $sizes[] = [
                'order_code' => '5106',
                'name' => '플라잉배너F형('.$def['key'].')',
                'working_width' => $def['w'],
                'working_height' => $def['h'],
                'additional_widths' => [],
                'additional_heights' => [],
                'is_default' => $def['is_default'],
                'erp_option_id' => $erpOptionIdMap[$def['key']] ?? null,
            ];
        }

        return $sizes;
    }

    /**
     * Find ERP option ID for a given order code and size name
     */
    private function findErpOptionId($orderCode, $name)
    {
        // For size options, we need to find the OP910 option that matches the order code and size name
        // The label/value contains patterns like:
        // - (실외)하이배너5012-H(단면)거치대 for 9505
        // - (실외)아이폴1530-H(단면)거치대 for 9506
        // - (실외)아이폴150-H(단면)거치대 for 9507
        // - (실외)아이폴100-H(단면)거치대 for 9508
        // - (실외)아이폴070-H(단면)거치대 for 9509
        // - (실내)롤업배너-H(060)거치대 for 9408

        // Map order code to label pattern
        $patterns = [
            '9505' => ['하이배너5012'],
            '9506' => ['아이폴1530'],
            '9507' => ['아이폴150'],
            '9508' => ['아이폴100'],
            '9509' => ['아이폴070'],
            '9408' => ['롤업배너'],
            '9401' => ['파워배너'],
            '9402' => ['업다운배너'],
            '9501' => ['파워배너-120'],
            '9502' => ['파워배너'],
            '9403' => ['하이배너-H'],
            // 9601-9605 입간판
            '9601' => ['철제배너-P'],
            '9602' => ['스틸입간판'],
            '9603' => ['플라잉보드-H'],
            '9604' => ['에스보드-H'],
            '9605' => ['A형철제입간판'],
        ];

        // For 96xx codes, use (입간판) prefix; for others use (실내)/(실외)
        $prefix = (str_starts_with($orderCode, '96')) ? '(입간판)' : null;

        if (! isset($patterns[$orderCode])) {
            $this->warn("No pattern mapping for order_code: {$orderCode}");

            return null;
        }

        // For 96xx codes, search using full name with (입간판) prefix and 거치대 suffix
        if ($prefix) {
            $searchName = $name;
            $erpOption = ErpOption::where('erp_option_group_id', 6)
                ->where('label', 'like', '%'.$searchName.'%')
                ->where('label', 'like', '%거치대%')
                ->first();

            if ($erpOption) {
                return $erpOption->id;
            }
        }

        // Determine if it's 양면
        $isDouble = strpos($name, '(양면)') !== false;
        $sideText = $isDouble ? '(양면)' : '(단면)';

        // Find the option that matches
        foreach ($patterns[$orderCode] as $pattern) {
            $erpOption = ErpOption::where('erp_option_group_id', 6)
                ->where('label', 'like', '%'.$pattern.'%')
                ->where('label', 'like', '%'.$sideText.'%')
                ->first();

            if ($erpOption) {
                return $erpOption->id;
            }
        }

        // Fallback: try without side
        $erpOption = ErpOption::where('erp_option_group_id', 6)
            ->where('label', 'like', '%'.$patterns[$orderCode][0].'%')
            ->first();

        if ($erpOption) {
            return $erpOption->id;
        }

        $this->warn("No OP910 option found for order_code: {$orderCode}, name: {$name}");

        return null;
    }

    /**
     * Get dynamic size data - ONLY base sizes (not expanded variants)
     *
     * The structure is: for each size name, create ONE base size with additional widths/heights as JSON metadata
     */
    private function getDynamicSizeData()
    {
        $sizes = [];

        // ===== 9401 파워(실내)배너 =====
        // arrSize2[9401]['파워[실내]배너'] = "1200,1300,1400,1500,1600,1700,1800,1900,2000"
        $sizes = array_merge($sizes, $this->generateSizesFor9401());

        // ===== 9402 업다운배너 =====
        // arrSize1[9402]['업다운배너'] = "600,500"
        // arrSize2[9402]['업다운배너'] = "1800,1600,1700,1500"
        $sizes = array_merge($sizes, $this->generateSizesFor9402());

        // ===== 9501 파워배너-120 =====
        // arrSize2[9501]['파워배너-120'] = "1200,1300,1400,1500,1600,1700,1800,1900,2000"
        $sizes = array_merge($sizes, $this->generateSizesFor9501());

        // ===== 9502 파워배너 =====
        // arrSize2[9502]['파워배너(단면)'] = "1800,1100,1200,1300,1400,1500,1600"
        // arrSize2[9502]['파워배너(양면)'] = "1800,1100,1200,1300,1400,1500,1600"
        $sizes = array_merge($sizes, $this->generateSizesFor9502());

        // ===== 9505 하이배너5012 =====
        // arrSize1[9505]['하이배너5012-H(단면)'] = "500,400"
        // arrSize1[9505]['하이배너5012-H(양면)'] = "500,400"
        $sizes = array_merge($sizes, $this->generateSizesFor9505());

        // ===== 9506 아이폴1530 =====
        // arrSize1[9506]['아이폴1530-H(단면)'] = "1500,1200,1100,1000"
        // arrSize2[9506]['아이폴1530-H(단면)'] = "1800,1900,2000,2100,2200,2300,2400,2500,2600,2700,2800,2900,3000"
        $sizes = array_merge($sizes, $this->generateSizesFor9506());

        // ===== 9507 아이폴150 =====
        // arrSize1[9507]['아이폴150-H(단면)'] = "1500,1100,1000"
        // arrSize2[9507]['아이폴150-H(단면)'] = "1200,1300,1400,1500,1600,1700,1800,1900,2000"
        $sizes = array_merge($sizes, $this->generateSizesFor9507());

        // ===== 9508 아이폴100 =====
        // arrSize1[9508]['아이폴100-H(단면)'] = "1000,900,800,700"
        // arrSize2[9508]['아이폴100-H(단면)'] = "1200,1300,1400,1500,1600,1700,1800,1900,2000"
        $sizes = array_merge($sizes, $this->generateSizesFor9508());

        // ===== 9509 아이폴070 =====
        // arrSize1[9509]['아이폴070-H(단면)'] = "700,600,500"
        // arrSize2[9509]['아이폴070-H(단면)'] = "1200,1300,1400,1500,1600,1700,1800,1900,2000"
        $sizes = array_merge($sizes, $this->generateSizesFor9509());

        // ===== 9408 롤업배너 =====
        // arrSize2[9408]['롤업배너-H(060)'] = "1600,1700,1800,1900,2000,2100,2200"
        // arrSize2[9408]['롤업배너-H(085)'] = "1600,1700,1800,1900,2000,2100,2200"
        // arrSize2[9408]['롤업배너-H(100)'] = "1800,1900,2000,2100,2200,2300,2400"
        // arrSize2[9408]['롤업배너-H(120)'] = "1800,1900,2000,2100,2200,2300,2400"
        // arrSize2[9408]['롤업배너-H(150)'] = "1800,1900,2000,2100,2200,2300"
        $sizes = array_merge($sizes, $this->generateSizesFor9408());

        // ===== 9403 하이배너 (Fixed sizes from arrSizeAdd) =====
        // arrSizeAdd[9403] = "<option value='600*1800'>하이배너-H(1800)</option><option value='600*1600'>하이배너-H(1600)</option>"
        $sizes = array_merge($sizes, $this->generateSizesFor9403());

        // ===== 2009 차량용자석 (FREE INPUT - default 500x200) =====
        $sizes = array_merge($sizes, $this->generateSizesFor2009());

        // ===== 2010 어깨띠 (Preset sizes from arrSizeAdd) =====
        $sizes = array_merge($sizes, $this->generateSizesFor2010());

        // ===== 9103 등신대 =====
        $sizes = array_merge($sizes, $this->generateSizesFor9103());

        // ===== 9105 미니등신대 =====
        $sizes = array_merge($sizes, $this->generateSizesFor9105());

        // ===== 9107 Banner events =====
        $sizes = array_merge($sizes, $this->generateSizesFor9107());

        // ===== 9201-9209 Banner output =====
        $sizes = array_merge($sizes, $this->generateSizesFor9200());

        // ===== 9301-9303 Mini banner =====
        $sizes = array_merge($sizes, $this->generateSizesFor9300());

        // ===== 9400 Indoor banner (거치대통합) =====
        $sizes = array_merge($sizes, $this->generateSizesFor9400());

        // ===== 9404 (Individual banner - default size) =====
        $sizes = array_merge($sizes, $this->generateSizesFor9404());

        // ===== 9405 (Quick banner B-H - fixed size 600*1800) =====
        $sizes = array_merge($sizes, $this->generateSizesFor9405());

        // ===== 9407 빅폴 =====
        $sizes = array_merge($sizes, $this->generateSizesFor9407());

        // ===== 9504 하이배너 =====
        $sizes = array_merge($sizes, $this->generateSizesFor9504());

        // ===== 9510-9512 Outdoor banners =====
        $sizes = array_merge($sizes, $this->generateSizesFor9500Extra());

        // ===== 9601-9605 입간판 =====
        $sizes = array_merge($sizes, $this->generateSizesFor9600());

        // ===== 2416 LED원형입간판 =====
        $sizes = array_merge($sizes, $this->generateSizesFor2416());

        // ===== 2413족자봉 (Media banner pole) =====
        $sizes = array_merge($sizes, $this->generateSizesFor2413());

        // ===== 2426 어깨띠(신규) =====
        $sizes = array_merge($sizes, $this->generateSizesFor2426());

        // ===== 2510 A형스틸보 =====
        $sizes = array_merge($sizes, $this->generateSizesFor2510());

        // ===== Order codes with FREE CUSTOM INPUT (no arrSizeAdd in legacy) =====
        // These order codes don't have preset sizes and allow free input
        $sizes = array_merge($sizes, $this->generateSizesForFreeInput());

        return $sizes;
    }

    private function generateSizesFor9401()
    {
        $sizes = [];

        // 파워배너(실내) - arrSize2: "1200,1300,1400,1500,1600,1700,1800,1900,2000"
        // Name must match OP910 label: "(실내)파워배너(실내)거치대" → "파워배너(실내)"
        // Note: old name was "파워[실내]배너" — delete stale record if it exists
        SizeOption::where('order_code', '9401')
            ->where('name', '파워[실내]배너')
            ->delete();

        $sizes[] = [
            'order_code' => '9401',
            'name' => '파워배너(실내)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
            'erp_option_id' => 22, // (실내)파워배너(실내)거치대
        ];

        return $sizes;
    }

    private function generateSizesFor9402()
    {
        $sizes = [];

        // 업다운배너 - arrSize1: "600,500", arrSize2: "1800,1600,1700,1500"
        // 단면
        $sizes[] = [
            'order_code' => '9402',
            'name' => '업다운배너',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [600, 500],
            'additional_heights' => [1800, 1600, 1700, 1500],
            'is_default' => true,
        ];

        return $sizes;
    }

    private function generateSizesFor9403()
    {
        $sizes = [];

        // 하이배너-H - arrSizeAdd: 600*1800, 600*1600 (fixed sizes, no additional)
        // These are FIXED sizes, not dynamic
        $sizes[] = [
            'order_code' => '9403',
            'name' => '하이배너-H(1800)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];

        $sizes[] = [
            'order_code' => '9403',
            'name' => '하이배너-H(1600)',
            'working_width' => 600,
            'working_height' => 1600,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        return $sizes;
    }

    private function generateSizesFor9501()
    {
        $sizes = [];

        // 파워배너-120 - arrSize2: "1200,1300,1400,1500,1600,1700,1800,1900,2000"
        $sizes[] = [
            'order_code' => '9501',
            'name' => '파워배너-120',
            'working_width' => 1200,
            'working_height' => 1200,
            'additional_widths' => [],
            'additional_heights' => [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000],
            'is_default' => true,
        ];

        return $sizes;
    }

    private function generateSizesFor9502()
    {
        $sizes = [];

        // 파워배너 - arrSize2: "1800,1100,1200,1300,1400,1500,1600"
        // 단면
        $sizes[] = [
            'order_code' => '9502',
            'name' => '파워배너(단면)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [1800, 1100, 1200, 1300, 1400, 1500, 1600],
            'is_default' => true,
        ];

        // 양면
        $sizes[] = [
            'order_code' => '9502',
            'name' => '파워배너(양면)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [1800, 1100, 1200, 1300, 1400, 1500, 1600],
            'is_default' => false,
        ];

        return $sizes;
    }

    private function generateSizesFor9505()
    {
        $sizes = [];

        // 하이배너5012 has base width 500, heights 1200
        // arrSize1[9505] = "500,400" (additional widths)
        // NO arrSize2 for 9505 - heights are fixed at 1200 only!
        // 단면
        $sizes[] = [
            'order_code' => '9505',
            'name' => '하이배너5012-H(단면)',
            'working_width' => 500,
            'working_height' => 1200,
            'additional_widths' => [500, 400],
            'additional_heights' => [], // No additional heights in legacy - only fixed 1200
            'is_default' => true,
        ];

        // 양면
        $sizes[] = [
            'order_code' => '9505',
            'name' => '하이배너5012-H(양면)',
            'working_width' => 500,
            'working_height' => 1200,
            'additional_widths' => [500, 400],
            'additional_heights' => [], // No additional heights in legacy - only fixed 1200
            'is_default' => false,
        ];

        return $sizes;
    }

    private function generateSizesFor9506()
    {
        $sizes = [];

        // 아이폴1530 has base width 1500, base height 1800
        // arrSize1: 1500,1200,1100,1000
        // arrSize2: 1800-3000

        // 단면
        $sizes[] = [
            'order_code' => '9506',
            'name' => '아이폴1530-H(단면)',
            'working_width' => 1500,
            'working_height' => 1800,
            'additional_widths' => [1500, 1200, 1100, 1000],
            'additional_heights' => [1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000],
            'is_default' => true,
        ];

        // 양면
        $sizes[] = [
            'order_code' => '9506',
            'name' => '아이폴1530-H(양면)',
            'working_width' => 1500,
            'working_height' => 1800,
            'additional_widths' => [1500, 1200, 1100, 1000],
            'additional_heights' => [1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000],
            'is_default' => false,
        ];

        return $sizes;
    }

    private function generateSizesFor9507()
    {
        $sizes = [];

        // 아이폴150 has base width 1500, base height 1200
        // arrSize1: 1500,1100,1000
        // arrSize2: 1200-2000

        // 단면
        $sizes[] = [
            'order_code' => '9507',
            'name' => '아이폴150-H(단면)',
            'working_width' => 1500,
            'working_height' => 1200,
            'additional_widths' => [1500, 1100, 1000],
            'additional_heights' => [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000],
            'is_default' => true,
        ];

        // 양면
        $sizes[] = [
            'order_code' => '9507',
            'name' => '아이폴150-H(양면)',
            'working_width' => 1500,
            'working_height' => 1200,
            'additional_widths' => [1500, 1100, 1000],
            'additional_heights' => [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000],
            'is_default' => false,
        ];

        return $sizes;
    }

    private function generateSizesFor9508()
    {
        $sizes = [];

        // 아이폴100 has base width 1000, base height 1200
        // arrSize1: 1000,900,800,700
        // arrSize2: 1200-2000

        // 단면
        $sizes[] = [
            'order_code' => '9508',
            'name' => '아이폴100-H(단면)',
            'working_width' => 1000,
            'working_height' => 1200,
            'additional_widths' => [1000, 900, 800, 700],
            'additional_heights' => [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000],
            'is_default' => true,
        ];

        // 양면
        $sizes[] = [
            'order_code' => '9508',
            'name' => '아이폴100-H(양면)',
            'working_width' => 1000,
            'working_height' => 1200,
            'additional_widths' => [1000, 900, 800, 700],
            'additional_heights' => [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000],
            'is_default' => false,
        ];

        return $sizes;
    }

    private function generateSizesFor9509()
    {
        $sizes = [];

        // 아이폴070 has base width 700, base height 1200
        // arrSize1: 700,600,500
        // arrSize2: 1200-2000

        // 단면
        $sizes[] = [
            'order_code' => '9509',
            'name' => '아이폴070-H(단면)',
            'working_width' => 700,
            'working_height' => 1200,
            'additional_widths' => [700, 600, 500],
            'additional_heights' => [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000],
            'is_default' => true,
        ];

        // 양면
        $sizes[] = [
            'order_code' => '9509',
            'name' => '아이폴070-H(양면)',
            'working_width' => 700,
            'working_height' => 1200,
            'additional_widths' => [700, 600, 500],
            'additional_heights' => [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000],
            'is_default' => false,
        ];

        return $sizes;
    }

    private function generateSizesFor9408()
    {
        $sizes = [];

        // 롤업배너 - each type maps to a specific OP910 거치대 option
        // OP910 labels: (실내)롤업배너-H(060)거치대 → id=26, (085)→27, (100)→28, (120)→29, (150)→30

        $types = [
            ['name' => '롤업배너-H(060)', 'w' => 600,  'h' => 1600, 'heights' => [1600, 1700, 1800, 1900, 2000, 2100, 2200], 'erp_option_id' => 26, 'default' => true],
            ['name' => '롤업배너-H(085)', 'w' => 850,  'h' => 1600, 'heights' => [1600, 1700, 1800, 1900, 2000, 2100, 2200], 'erp_option_id' => 27, 'default' => false],
            ['name' => '롤업배너-H(100)', 'w' => 1000, 'h' => 1800, 'heights' => [1800, 1900, 2000, 2100, 2200, 2300, 2400], 'erp_option_id' => 28, 'default' => false],
            ['name' => '롤업배너-H(120)', 'w' => 1200, 'h' => 1800, 'heights' => [1800, 1900, 2000, 2100, 2200, 2300, 2400], 'erp_option_id' => 29, 'default' => false],
            ['name' => '롤업배너-H(150)', 'w' => 1500, 'h' => 1800, 'heights' => [1800, 1900, 2000, 2100, 2200, 2300],       'erp_option_id' => 30, 'default' => false],
        ];

        foreach ($types as $type) {
            $sizes[] = [
                'order_code' => '9408',
                'name' => $type['name'],
                'working_width' => $type['w'],
                'working_height' => $type['h'],
                'additional_widths' => [],
                'additional_heights' => $type['heights'],
                'is_default' => $type['default'],
                'erp_option_id' => $type['erp_option_id'],
            ];
        }

        return $sizes;
    }

    // ===== NEW FUNCTIONS FOR MISSING ORDER CODES =====

    /**
     * 2009 차량용자석 - FREE INPUT (default 500x200)
     * No preset sizes, allows custom input
     */
    private function generateSizesFor2009()
    {
        $sizes = [];

        // Free input - editor can enter any size
        $sizes[] = [
            'order_code' => '2009',
            'name' => '자유입력',
            'working_width' => 500,
            'working_height' => 200,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
            'is_custom_input_allowed' => true,
            'min_width' => 100,
            'max_width' => 2380,
            'min_height' => 100,
            'max_height' => 980,
            'width_step' => 1,
            'height_step' => 1,
        ];

        return $sizes;
    }

    /**
     * 2010 어깨띠 - Preset sizes from arrSizeAdd
     * 100*1790 to 150*2000
     */
    private function generateSizesFor2010()
    {
        $sizes = [];

        // arrSizeAdd[2010] = "100*1790, 110*1790, ..., 150*2000"
        $presetSizes = [
            ['w' => 100, 'h' => 1790],
            ['w' => 110, 'h' => 1790],
            ['w' => 120, 'h' => 1790],
            ['w' => 130, 'h' => 1790],
            ['w' => 140, 'h' => 1790],
            ['w' => 150, 'h' => 1790],
            ['w' => 100, 'h' => 2000],
            ['w' => 110, 'h' => 2000],
            ['w' => 120, 'h' => 2000],
            ['w' => 130, 'h' => 2000],
            ['w' => 140, 'h' => 2000],
            ['w' => 150, 'h' => 2000],
        ];

        $isDefault = true;
        foreach ($presetSizes as $size) {
            $sizes[] = [
                'order_code' => '2010',
                'name' => $size['w'].'*'.$size['h'],
                'working_width' => $size['w'],
                'working_height' => $size['h'],
                'additional_widths' => [],
                'additional_heights' => [],
                'is_default' => $isDefault,
                'is_custom_input_allowed' => false,
            ];
            $isDefault = false;
        }

        return $sizes;
    }

    /**
     * 9103 등신대
     */
    private function generateSizesFor9103()
    {
        $sizes = [];

        // arrSizeAdd[9103] = "600*1800, 900*1800"
        $sizes[] = [
            'order_code' => '9103',
            'name' => '소형',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];

        $sizes[] = [
            'order_code' => '9103',
            'name' => '대형',
            'working_width' => 900,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        return $sizes;
    }

    /**
     * 9105 미니등신대
     */
    private function generateSizesFor9105()
    {
        $sizes = [];

        // arrSizeAdd[9105] = "210*297, 297*210, ..."
        $sizes[] = [
            'order_code' => '9105',
            'name' => '2컷A',
            'working_width' => 210,
            'working_height' => 297,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];

        $sizes[] = [
            'order_code' => '9105',
            'name' => '2컷B',
            'working_width' => 297,
            'working_height' => 210,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        $sizes[] = [
            'order_code' => '9105',
            'name' => '4컷',
            'working_width' => 210,
            'working_height' => 297,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        $sizes[] = [
            'order_code' => '9105',
            'name' => '5컷A',
            'working_width' => 297,
            'working_height' => 210,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        $sizes[] = [
            'order_code' => '9105',
            'name' => '5컷B',
            'working_width' => 297,
            'working_height' => 210,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        $sizes[] = [
            'order_code' => '9105',
            'name' => '6컷',
            'working_width' => 297,
            'working_height' => 210,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        return $sizes;
    }

    /**
     * 9107 Banner events
     * Legacy: Uses setEasyset9106() - has preset sizes with dropdown selection
     * arrSizeAdd[9107] = "600*400, 300*200, 500*300, 900*600"
     * Note: This is a preset dropdown - no custom input, no additional width/height
     */
    private function generateSizesFor9107()
    {
        $sizes = [];

        // arrSizeAdd[9107] = "600*400, 300*200, 500*300, 900*600"
        // These are preset sizes in a dropdown - no additional options
        $presetSizes = [
            ['w' => 600, 'h' => 400, 'name' => '기본', 'default' => true],
            ['w' => 300, 'h' => 200, 'name' => '소형', 'default' => false],
            ['w' => 500, 'h' => 300, 'name' => '중형', 'default' => false],
            ['w' => 900, 'h' => 600, 'name' => '대형', 'default' => false],
        ];

        foreach ($presetSizes as $size) {
            $sizes[] = [
                'order_code' => '9107',
                'name' => $size['name'],
                'working_width' => $size['w'],
                'working_height' => $size['h'],
                // Empty arrays - this is a pure dropdown selection
                'additional_widths' => [],
                'additional_heights' => [],
                'is_default' => $size['default'],
                // No custom input allowed - this is preset dropdown only
                'is_custom_input_allowed' => false,
            ];
        }

        return $sizes;
    }

    /**
     * 9201-9209 Banner output
     * Note: 9203 uses material name as size label (투명필름(비접착)) - hidden in UI
     */
    private function generateSizesFor9200()
    {
        $sizes = [];

        // Basic size 600*1800 for most codes
        $orderCodes = ['9201', '9202', '9204', '9205', '9206', '9207', '9208', '9209'];

        foreach ($orderCodes as $code) {
            $sizes[] = [
                'order_code' => $code,
                'name' => '기본',
                'working_width' => 600,
                'working_height' => 1800,
                'additional_widths' => [],
                'additional_heights' => [],
                'is_default' => true,
            ];
        }

        // 9203: Uses material name "투명필름(비접착)" as size label
        // Size is 600x1800 but hidden in UI (display:none)
        $sizes[] = [
            'order_code' => '9203',
            'name' => '투명필름(비접착)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
            'is_custom_input_allowed' => false,
        ];

        return $sizes;
    }

    /**
     * 9301-9303 Mini banner
     */
    private function generateSizesFor9300()
    {
        $sizes = [];

        // 9301
        $sizes[] = [
            'order_code' => '9301',
            'name' => '소형',
            'working_width' => 150,
            'working_height' => 300,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];
        $sizes[] = [
            'order_code' => '9301',
            'name' => '대형',
            'working_width' => 180,
            'working_height' => 420,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        // 9302
        $sizes[] = [
            'order_code' => '9302',
            'name' => '소형',
            'working_width' => 150,
            'working_height' => 300,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];
        $sizes[] = [
            'order_code' => '9302',
            'name' => '대형',
            'working_width' => 180,
            'working_height' => 420,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        // 9303
        $sizes[] = [
            'order_code' => '9303',
            'name' => '대형',
            'working_width' => 600,
            'working_height' => 400,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];
        $sizes[] = [
            'order_code' => '9303',
            'name' => '소형',
            'working_width' => 500,
            'working_height' => 330,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        return $sizes;
    }

    /**
     * 9400 Indoor banner (거치대통합)
     */
    private function generateSizesFor9400()
    {
        $sizes = [];

        // Similar to 9402
        $sizes[] = [
            'order_code' => '9400',
            'name' => '업다운배너',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [600, 500],
            'additional_heights' => [1800, 1600, 1700, 1500],
            'is_default' => true,
        ];

        return $sizes;
    }

    /**
     * 9407 빅폴
     */
    private function generateSizesFor9407()
    {
        $sizes = [];

        // arrSize2[9407]
        $types = [
            ['name' => '빅폴-H(050)', 'w' => 500, 'h' => [1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800]],
            ['name' => '빅폴-H(060)', 'w' => 600, 'h' => [1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800]],
            ['name' => '빅폴-H(080)', 'w' => 800, 'h' => [1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300]],
            ['name' => '빅폴-H(100)', 'w' => 1000, 'h' => [1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400]],
            ['name' => '빅폴-H(120)', 'w' => 1200, 'h' => [1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400]],
            ['name' => '빅폴-H(150)', 'w' => 1500, 'h' => [1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400]],
            ['name' => '빅폴-H(1530)', 'w' => 1500, 'h' => [1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000]],
        ];

        $isDefault = true;
        foreach ($types as $type) {
            $sizes[] = [
                'order_code' => '9407',
                'name' => $type['name'],
                'working_width' => $type['w'],
                'working_height' => $type['h'][0],
                'additional_widths' => [],
                'additional_heights' => $type['h'],
                'is_default' => $isDefault,
            ];
            $isDefault = false;
        }

        return $sizes;
    }

    /**
     * 9504 하이배너
     */
    private function generateSizesFor9504()
    {
        $sizes = [];

        // arrSizeAdd[9504] = "600*1800 (단면/양면)"
        // arrSize1[9504] = "600,500"
        // arrSize2[9504] = "1800,1600,1700"
        $sizes[] = [
            'order_code' => '9504',
            'name' => '하이배너-H(단면)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [600, 500],
            'additional_heights' => [1800, 1600, 1700],
            'is_default' => true,
        ];

        $sizes[] = [
            'order_code' => '9504',
            'name' => '하이배너-H(양면)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [600, 500],
            'additional_heights' => [1800, 1600, 1700],
            'is_default' => false,
        ];

        return $sizes;
    }

    /**
     * 9510-9512 Outdoor banners extra
     */
    private function generateSizesFor9500Extra()
    {
        $sizes = [];

        // 9510 워킹배너(X형)
        $sizes[] = [
            'order_code' => '9510',
            'name' => '워킹배너(X형)',
            'working_width' => 500,
            'working_height' => 1200,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];

        // 9511 실외물통배너-P
        $sizes[] = [
            'order_code' => '9511',
            'name' => '실외물통배너-P(단면)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];
        $sizes[] = [
            'order_code' => '9511',
            'name' => '실외물통배너-P(양면)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        // 9512 넘버원배너-L
        $sizes[] = [
            'order_code' => '9512',
            'name' => '넘버원배너-L(단면)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];
        $sizes[] = [
            'order_code' => '9512',
            'name' => '넘버원배너-L(양면)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        return $sizes;
    }

    /**
     * 9601-9605 입간판
     */
    private function generateSizesFor9600()
    {
        $sizes = [];

        // 9601 철제배너-P
        $sizes[] = [
            'order_code' => '9601',
            'name' => '철제배너-P(6018물통)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];
        $sizes[] = [
            'order_code' => '9601',
            'name' => '철제배너-P(6018)',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];
        $sizes[] = [
            'order_code' => '9601',
            'name' => '철제배너-P(5015)',
            'working_width' => 500,
            'working_height' => 1500,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        // 9602 스틸입간판-H
        $sizes[] = [
            'order_code' => '9602',
            'name' => '스틸입간판-H',
            'working_width' => 580,
            'working_height' => 1195,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];

        // 9603 플라잉보드-H
        $sizes[] = [
            'order_code' => '9603',
            'name' => '플라잉보드-H(594)',
            'working_width' => 594,
            'working_height' => 841,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];
        $sizes[] = [
            'order_code' => '9603',
            'name' => '플라잉보드-H(500)',
            'working_width' => 500,
            'working_height' => 1200,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        // 9604 에스보드-H
        $presetSizes = [
            ['w' => 594, 'h' => 841, 'name' => '에스보드-H(A1)'],
            ['w' => 400, 'h' => 1300, 'name' => '에스보드-H(T400)'],
            ['w' => 500, 'h' => 1500, 'name' => '에스보드-H(T500)'],
            ['w' => 600, 'h' => 1000, 'name' => '에스보드-H(T600)'],
        ];

        $isDefault = true;
        foreach ($presetSizes as $size) {
            $sizes[] = [
                'order_code' => '9604',
                'name' => $size['name'],
                'working_width' => $size['w'],
                'working_height' => $size['h'],
                'additional_widths' => [],
                'additional_heights' => [],
                'is_default' => $isDefault,
            ];
            $isDefault = false;
        }

        // 9605 A형철제입간판-P
        $sizes[] = [
            'order_code' => '9605',
            'name' => 'A형철제입간판-P(단면)',
            'working_width' => 600,
            'working_height' => 900,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];
        $sizes[] = [
            'order_code' => '9605',
            'name' => 'A형철제입간판-P(양면)',
            'working_width' => 600,
            'working_height' => 900,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        return $sizes;
    }

    /**
     * 2416 LED원형입간판
     */
    private function generateSizesFor2416()
    {
        $sizes = [];

        $sizes[] = [
            'order_code' => '2416',
            'name' => 'LED원형입간판',
            'working_width' => 1430,
            'working_height' => 1135,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];

        return $sizes;
    }

    /**
     * 2426 어깨띠(신규)
     */
    private function generateSizesFor2426()
    {
        $sizes = [];

        // arrSizeAdd[2426]
        $sizes[] = [
            'order_code' => '2426',
            'name' => '삼각형(단면)',
            'working_width' => 305,
            'working_height' => 200,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];
        $sizes[] = [
            'order_code' => '2426',
            'name' => '삼각형(양면)',
            'working_width' => 305,
            'working_height' => 300,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];
        $sizes[] = [
            'order_code' => '2426',
            'name' => '사각형(단면)',
            'working_width' => 305,
            'working_height' => 200,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];
        $sizes[] = [
            'order_code' => '2426',
            'name' => '사각형(양면)',
            'working_width' => 610,
            'working_height' => 200,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];
        $sizes[] = [
            'order_code' => '2426',
            'name' => '날개형(단면)',
            'working_width' => 305,
            'working_height' => 200,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];
        $sizes[] = [
            'order_code' => '2426',
            'name' => '날개형(양면)',
            'working_width' => 610,
            'working_height' => 200,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => false,
        ];

        return $sizes;
    }

    /**
     * 2510 A형스틸보
     */
    private function generateSizesFor2510()
    {
        $sizes = [];

        // arrSizeAdd[2510]
        $presetSizes = [
            ['w' => 300, 'h' => 520, 'name' => 'A형스틸보(소)블랙'],
            ['w' => 300, 'h' => 520, 'name' => 'A형스틸보(소)화이트'],
            ['w' => 350, 'h' => 670, 'name' => 'A형스틸보(중)블랙'],
            ['w' => 350, 'h' => 670, 'name' => 'A형스틸보(중)화이트'],
            ['w' => 400, 'h' => 820, 'name' => 'A형스틸보(대)블랙'],
            ['w' => 400, 'h' => 820, 'name' => 'A형스틸보(대)화이트'],
        ];

        $isDefault = true;
        foreach ($presetSizes as $size) {
            $sizes[] = [
                'order_code' => '2510',
                'name' => $size['name'],
                'working_width' => $size['w'],
                'working_height' => $size['h'],
                'additional_widths' => [],
                'additional_heights' => [],
                'is_default' => $isDefault,
            ];
            $isDefault = false;
        }

        return $sizes;
    }

    /**
     * 9404 퀵배너A-H
     *
     * According to order_02.js:2078-2080, when item_code3 is between 9401-9499
     * and arrSizeAdd[item_code3] doesn't exist, it defaults to 600*1800
     */
    private function generateSizesFor9404()
    {
        $sizes = [];

        // Default size when no arrSizeAdd is defined - using 600*1800
        $sizes[] = [
            'order_code' => '9404',
            'name' => '퀵배너A-H',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];

        return $sizes;
    }

    /**
     * 9405 퀵배너B-H (Quick banner B-H)
     *
     * According to order_02.js:2078-2080, when item_code3 is between 9401-9499
     * and arrSizeAdd[item_code3] doesn't exist, it defaults to 600*1800
     * Production name is "퀵배너B-H"
     */
    private function generateSizesFor9405()
    {
        $sizes = [];

        // Default size when no arrSizeAdd is defined - using 600*1800
        $sizes[] = [
            'order_code' => '9405',
            'name' => '퀵배너B-H',
            'working_width' => 600,
            'working_height' => 1800,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
        ];

        return $sizes;
    }

    /**
     * 2413족자봉 (Media banner pole)
     *
     * From setEasyset2413() in order_02.js - sets default size to 600x1500
     * Validation rules from order_02.js:825-832:
     * - width <= 1480: height can be up to 10000
     * - width 1480-2900: height can be up to 1480
     * - width > 2900: show alert and reset to 500x500
     */
    private function generateSizesFor2413()
    {
        $sizes = [];

        // Default size from setEasyset2413() - 600x1500
        // Allow custom input with max_width = 2900
        $sizes[] = [
            'order_code' => '2413',
            'name' => '족자봉',
            'working_width' => 600,
            'working_height' => 1500,
            'additional_widths' => [],
            'additional_heights' => [],
            'is_default' => true,
            'is_custom_input_allowed' => true,
            'min_width' => 100,
            'max_width' => 2900,  // Max width from legacy validation
            'width_step' => 1,
            'height_step' => 1,
        ];

        return $sizes;
    }

    /**
     * Order codes with FREE CUSTOM INPUT (no arrSizeAdd in legacy)
     * These order codes don't have preset sizes and allow free input
     * Based on validation rules in order_02.js lines 791-840
     */
    private function generateSizesForFreeInput()
    {
        $sizes = [];

        // Order codes that don't have arrSizeAdd in legacy JS
        // They allow free custom input with specific limits
        $freeInputConfigs = [
            // 2011 - 배면접착유포지 (order_02.js:821)
            '2011' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1200, 'default_w' => 500, 'default_h' => 500],
            // 2012 - 블록아웃PET (order_02.js:815)
            '2012' => ['min_w' => 100, 'max_w' => 2390, 'min_h' => 100, 'max_h' => 1230, 'default_w' => 500, 'default_h' => 500],
            // 2201 - 시트지 (order_02.js:835)
            '2201' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1480, 'default_w' => 500, 'default_h' => 500],
            // 2203 - 원웨이필름 (order_02.js:797)
            '2203' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1320, 'default_w' => 500, 'default_h' => 500],
            // 2204 - 반사지 (order_02.js:792)
            '2204' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1160, 'default_w' => 500, 'default_h' => 500],
            // 2205 - 시트지 (general)
            '2205' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1480, 'default_w' => 500, 'default_h' => 500],
            // 2206 - 시트지/원웨이 (general)
            '2206' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1320, 'default_w' => 500, 'default_h' => 500],
            // 2306 - 실사출력 (general)
            '2306' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1480, 'default_w' => 500, 'default_h' => 500],
            // 2309 - 실사출력 (general)
            '2309' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1480, 'default_w' => 500, 'default_h' => 500],
            // 2314 - 실사출력 (general)
            '2314' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1480, 'default_w' => 500, 'default_h' => 500],
            // 2411 - 일반시트지 (order_02.js:823)
            '2411' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1230, 'default_w' => 500, 'default_h' => 500],
            // 2412 - 일반시트지 (general)
            '2412' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1230, 'default_w' => 500, 'default_h' => 500],
            // 2420 - 플렉스 (order_02.js:838-840)
            '2420' => ['min_w' => 100, 'max_w' => 20000, 'min_h' => 100, 'max_h' => 3000, 'default_w' => 1000, 'default_h' => 1000],
            // Note: 5105 and 5106 use FIXED sizes (not custom input) - handled separately in database
            // 5105 - 플라잉배너S형 (fixed sizes: 대 800x3800, 중 700x3000, 소 650x1950)
            // 5106 - 플라잉배너F형 (fixed sizes: 대 800x3800, 중 700x3000, 소 650x1950)
            // 9405 - 퀵배너B-H (now handled in generateSizesFor9405() - fixed size 600*1800)
            // 2001-2008 Various products
            '2001' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1480, 'default_w' => 500, 'default_h' => 500],
            '2002' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1480, 'default_w' => 500, 'default_h' => 500],
            '2003' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1480, 'default_w' => 500, 'default_h' => 500],
            '2004' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1480, 'default_w' => 500, 'default_h' => 500],
            '2005' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1480, 'default_w' => 500, 'default_h' => 500],
            '2008' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1480, 'default_w' => 500, 'default_h' => 500],
            // 2016 - 바닥시트/항균코팅지 (max_h=1240 per SizeLimitService)
            '2016' => ['min_w' => 100, 'max_w' => 5000, 'min_h' => 100, 'max_h' => 1240, 'default_w' => 500, 'default_h' => 500],
            // 1123 - 현수막/족자봉 (max_w=2900, max_h=10000, default=600x1000 per legacy)
            '1123' => ['min_w' => 100, 'max_w' => 2900, 'min_h' => 100, 'max_h' => 10000, 'default_w' => 600, 'default_h' => 1000],
        ];

        foreach ($freeInputConfigs as $orderCode => $config) {
            $sizes[] = [
                'order_code' => $orderCode,
                'name' => '자유입력',
                'working_width' => $config['default_w'],
                'working_height' => $config['default_h'],
                'additional_widths' => [],
                'additional_heights' => [],
                'is_default' => true,
                'is_custom_input_allowed' => true,
                'min_width' => $config['min_w'],
                'max_width' => $config['max_w'],
                'min_height' => $config['min_h'],
                'max_height' => $config['max_h'],
                'width_step' => 1,
                'height_step' => 1,
            ];
        }

        return $sizes;
    }
}
