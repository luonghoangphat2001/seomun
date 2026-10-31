<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Fix product-specific option issues:
 * 1. 9401 - OP910 allowed=[22] (파워배너(실내)거치대)
 * 2. 9404, 9405, 9510 - size additional_widths/heights like 9402
 * 3. 9408 - add 쇠고리 to OP909; ensure all OP910 거치대 mapped; restore erp_option_id on sizes
 * 4. 9512 - OP910 filter by size (단면/양면)
 * 5. 9601 - OP910 filter by size (set erp_option_id on sizes)
 * 6. 9505-9509 - remove non-단면/양면 size rows
 */
class ProductOptionFixSeeder extends Seeder
{
    public function run(): void
    {
        $this->fix9401();
        $this->fix9404SizeOptions();
        $this->fix9405SizeOptions();
        $this->fix9510SizeOptions();
        $this->fix9408();
        $this->fix9512();
        $this->fix9601();
        $this->fix9505to9509SizeOptions();
        $this->fixMissingOp906Groups();
        $this->fixMissingSizeErpOptionIds();
        $this->fixDefaultOptions();
        $this->fixCoatingDefaults();
        $this->fix9508DefaultOption();
        $this->fix5105And5106AdditionalWidths();
        $this->fix5106Sizes();
        $this->fix1123DefaultOp908();
        $this->fix2412MissingOptions();
        $this->fix2201_2206_2314RemoveOp906();
        $this->fix1123DefaultOp910();

        $this->command->info('ProductOptionFixSeeder completed.');
    }

    /**
     * 9401 - 파워(실내)배너
     * OP910 phải hiện 거치대 tương ứng: allowed=[22] (파워배너(실내)거치대)
     */
    protected function fix9401(): void
    {
        DB::table('erp_option_dependencies')
            ->where('order_code', '9401')
            ->where('affected_option_group_id', 6)
            ->update(['allowed_options' => json_encode([22])]);

        $this->command->info('9401: OP910 allowed=[22] (파워배너(실내)거치대)');
    }

    /**
     * 9404 - 실내용 퀵배너A
     * Size selectbox phải hiển thị như 9402 (có additional_widths/heights)
     * 9402 reference: add_w=[600,500], add_h=[1800,1600,1700,1500]
     * 9404 có 2 size rows: id=53 (Default), id=55 (퀵배너A-H)
     * Xóa row Default (id=53), giữ id=55 và thêm additional options
     */
    protected function fix9404SizeOptions(): void
    {
        // Xóa row "Default" thừa
        DB::table('erp_size_options')
            ->where('order_code', '9404')
            ->where('name', 'Default')
            ->delete();

        // Update 퀵배너A-H với additional widths/heights như 9402
        DB::table('erp_size_options')
            ->where('order_code', '9404')
            ->where('name', '퀵배너A-H')
            ->update([
                'additional_widths' => json_encode([600, 500]),
                'additional_heights' => json_encode([1800, 1600, 1700, 1500]),
                'is_default' => 1,
            ]);

        $this->command->info('9404: size options updated with additional_widths/heights');
    }

    /**
     * 9405 - 실내용 퀵배너B
     * Size selectbox phải hiển thị như 9402
     */
    protected function fix9405SizeOptions(): void
    {
        DB::table('erp_size_options')
            ->where('order_code', '9405')
            ->where('name', '퀵배너B-H')
            ->update([
                'additional_widths' => json_encode([600, 500]),
                'additional_heights' => json_encode([1800, 1600, 1700, 1500]),
                'is_default' => 1,
            ]);

        $this->command->info('9405: size options updated with additional_widths/heights');
    }

    /**
     * 9510 - 워킹배너
     * Size selectbox phải hiển thị như 9402
     * 워킹배너 size: w=500, h=1200
     */
    protected function fix9510SizeOptions(): void
    {
        DB::table('erp_size_options')
            ->where('order_code', '9510')
            ->where('name', '워킹배너(X형)')
            ->update([
                'additional_widths' => json_encode([500, 400]),
                'additional_heights' => json_encode([1200, 1000, 1100, 900]),
                'is_default' => 1,
            ]);

        $this->command->info('9510: size options updated with additional_widths/heights');
    }

    /**
     * 9408 - 롤업배너-H
     * 1. OP909: thêm 쇠고리(id=120) vào order_code_erp_option mapping
     * 2. Ensure OP910 거치대 options (id=26-30) are mapped in order_code_erp_option
     * 3. Keep erp_option_id on sizes (SeedDynamicSizeOptions sets: 060→26, 085→27, 100→28, 120→29, 150→30)
     * 4. Dependencies: OP904, OP906, OP907, OP909 only (OP910 filtered by erp_option_id on size)
     */
    protected function fix9408(): void
    {
        $mapping9408 = DB::table('order_code_option_mappings')
            ->where('order_code', '9408')
            ->first();

        // 1. Thêm 쇠고리(id=120) vào OP909 mapping cho 9408
        $alreadyMapped = DB::table('order_code_erp_option')
            ->where('order_code_id', $mapping9408->id)
            ->where('erp_option_id', 120)
            ->exists();

        if (! $alreadyMapped) {
            DB::table('order_code_erp_option')->insert([
                'order_code_id' => $mapping9408->id,
                'erp_option_id' => 120, // 쇠고리
                'product_type_condition' => null,
                'osrc_um' => null,
            ]);
            $this->command->info('9408: 쇠고리(id=120) added to OP909 mapping');
        }

        // 2. Ensure OP910 거치대 options are mapped for all sizes
        // OP910 labels: (실내)롤업배너-H(060)거치대 → id=26, (085)→27, (100)→28, (120)→29, (150)→30
        $standIds = [26, 27, 28, 29, 30];
        foreach ($standIds as $standId) {
            $standMapped = DB::table('order_code_erp_option')
                ->where('order_code_id', $mapping9408->id)
                ->where('erp_option_id', $standId)
                ->exists();

            if (! $standMapped) {
                DB::table('order_code_erp_option')->insert([
                    'order_code_id' => $mapping9408->id,
                    'erp_option_id' => $standId,
                    'product_type_condition' => null,
                    'osrc_um' => null,
                ]);
                $this->command->info("9408: OP910 거치대 id={$standId} mapped");
            }
        }

        // 3. Ensure erp_option_id is set on sizes (do NOT set to null)
        // SeedDynamicSizeOptions already sets: H(060)→26, H(085)→27, H(100)→28, H(120)→29, H(150)→30
        // Just verify and restore if missing
        $sizeToOption = [
            '롤업배너-H(060)' => 26,
            '롤업배너-H(085)' => 27,
            '롤업배너-H(100)' => 28,
            '롤업배너-H(120)' => 29,
            '롤업배너-H(150)' => 30,
        ];
        foreach ($sizeToOption as $sizeName => $erpOptionId) {
            DB::table('erp_size_options')
                ->where('order_code', '9408')
                ->where('name', $sizeName)
                ->whereNull('erp_option_id')
                ->update(['erp_option_id' => $erpOptionId]);
        }

        // 4. Update dependencies: only OP904, OP906, OP907, OP909
        // OP910 is filtered by erp_option_id on size, NOT by dependency
        DB::table('erp_option_dependencies')
            ->where('order_code', '9408')
            ->delete();

        // 9408 chỉ có 1 소재: 패트(수성) id=1
        // OP904=13(수성4색), OP906=[14,15], OP907=16, OP909=[17,120]
        $now = now();
        DB::table('erp_option_dependencies')->insert([
            // OP904 (잉크)
            ['order_code' => '9408', 'trigger_option_group_id' => 1, 'trigger_option_id' => 1,
                'size_option_id' => null, 'affected_option_group_id' => 2, 'allowed_options' => json_encode([13]),
                'created_at' => $now, 'updated_at' => $now],
            // OP906 (코팅)
            ['order_code' => '9408', 'trigger_option_group_id' => 1, 'trigger_option_id' => 1,
                'size_option_id' => null, 'affected_option_group_id' => 3, 'allowed_options' => json_encode([14, 15]),
                'created_at' => $now, 'updated_at' => $now],
            // OP907 (재단)
            ['order_code' => '9408', 'trigger_option_group_id' => 1, 'trigger_option_id' => 1,
                'size_option_id' => null, 'affected_option_group_id' => 4, 'allowed_options' => json_encode([16]),
                'created_at' => $now, 'updated_at' => $now],
            // OP909 (추가후가공): 사방쇠고리(17) + 쇠고리(120)
            ['order_code' => '9408', 'trigger_option_group_id' => 1, 'trigger_option_id' => 1,
                'size_option_id' => null, 'affected_option_group_id' => 5, 'allowed_options' => json_encode([17, 120]),
                'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->command->info('9408: fix completed - OP910 filtered by erp_option_id on size');
    }

    /**
     * 9512 - 실외용 배너 (넘버원배너-L)
     * OP910 filter theo size: 단면(id=48)→opt31; 양면(id=49)→opt32
     * Fix: set erp_option_id trên size rows
     */
    protected function fix9512(): void
    {
        // size 48 (단면) → erp_option_id = 31
        DB::table('erp_size_options')
            ->where('order_code', '9512')
            ->where('name', '넘버원배너-L(단면)')
            ->update(['erp_option_id' => 31]);

        // size 49 (양면) → erp_option_id = 32
        DB::table('erp_size_options')
            ->where('order_code', '9512')
            ->where('name', '넘버원배너-L(양면)')
            ->update(['erp_option_id' => 32]);

        $this->command->info('9512: erp_option_id set on size options for OP910 filtering');
    }

    /**
     * 9601 - 철제배너-PY
     * OP910 filter theo size:
     * - 철제배너-P(6018물통)(id=50) → opt34
     * - 철제배너-P(6018)(id=51) → opt35 (already set)
     * - 철제배너-P(5015)(id=52) → opt36 (already set)
     */
    protected function fix9601(): void
    {
        // size 50 (6018물통) → erp_option_id = 34
        DB::table('erp_size_options')
            ->where('order_code', '9601')
            ->where('name', '철제배너-P(6018물통)')
            ->update(['erp_option_id' => 34]);

        $this->command->info('9601: erp_option_id=34 set for 철제배너-P(6018물통)');
    }

    /**
     * 9505-9509 - 하이배너/아이폴 series
     * Size selectbox chỉ hiện 단면/양면
     * Xóa các size rows không phải 단면/양면 (tên cũ không có suffix)
     */
    protected function fix9505to9509SizeOptions(): void
    {
        $fixes = [
            // 9505: giữ id=201(단면), id=7(양면); xóa không có
            '9505' => ['keep_pattern' => ['단면', '양면']],
            // 9506: giữ id=202(단면), id=9(양면); xóa id=8 (아이폴1530-H không suffix)
            '9506' => ['keep_pattern' => ['단면', '양면']],
            // 9507: giữ id=203(단면), id=11(양면); xóa id=10 (아이폴150-H không suffix)
            '9507' => ['keep_pattern' => ['단면', '양면']],
            // 9508: giữ id=204(단면), id=13(양면); xóa id=12 (아이폴100-H không suffix)
            '9508' => ['keep_pattern' => ['단면', '양면']],
            // 9509: giữ id=205(단면), id=15(양면); xóa id=14 (아이폴070-H không suffix)
            '9509' => ['keep_pattern' => ['단면', '양면']],
        ];

        foreach ($fixes as $orderCode => $config) {
            // Xóa các rows không chứa 단면 hoặc 양면 trong tên
            $deleted = DB::table('erp_size_options')
                ->where('order_code', $orderCode)
                ->where(function ($q) {
                    $q->where('name', 'not like', '%단면%')
                        ->where('name', 'not like', '%양면%');
                })
                ->delete();

            $this->command->info("{$orderCode}: removed {$deleted} non-단면/양면 size rows");
        }
    }

    /**
     * Add OP906 group mapping for products that need "코팅없음" fallback
     * but don't have the group mapped at all.
     * Products with group mapped but 0 options are handled by API virtual option logic.
     */
    protected function fixMissingOp906Groups(): void
    {
        // These products have no OP906 group mapped at all → add the group
        $codesNeedingOp906Group = [
            '9202', '9203', '9204', '9205', '9206', // 배너 variants
            '2411',                                   // 폼보드 포스터
            '2412', '2306', '2204', '2309', '2205',  // previously fixed (idempotent)
        ];

        $op906GroupId = DB::table('erp_option_groups')->where('code', 'OP906')->value('id');

        foreach ($codesNeedingOp906Group as $code) {
            $mapping = DB::table('order_code_option_mappings')->where('order_code', $code)->first();
            if (! $mapping) {
                $this->command->warn("{$code}: no order_code_option_mapping found, skipping");

                continue;
            }

            $alreadyMapped = DB::table('order_code_erp_option_group')
                ->where('order_code_id', $mapping->id)
                ->where('erp_option_group_id', $op906GroupId)
                ->exists();

            if (! $alreadyMapped) {
                DB::table('order_code_erp_option_group')->insert([
                    'order_code_id' => $mapping->id,
                    'erp_option_group_id' => $op906GroupId,
                ]);
                $this->command->info("{$code}: OP906 group added");
            } else {
                $this->command->info("{$code}: OP906 group already mapped");
            }
        }
    }

    /**
     * Fix missing erp_option_id on size rows that have a 1-1 match with OP910 options.
     * Pattern: size label is contained in OP910 option label (or vice versa).
     * This enables the API to auto-filter OP910 based on selected size.
     *
     * Only fixes sizes with a clear 1-1 mapping.
     * Multi-option products (9103, 9301, etc.) are left as-is (show all OP910 options).
     */
    protected function fixMissingSizeErpOptionIds(): void
    {
        // Explicit 1-1 size → OP910 option mappings that are missing erp_option_id
        // Format: [size_id => erp_option_id]
        $mappings = [
            // 9404 - 실내용 퀵배너A
            55 => 20,   // 퀵배너A-H → (실내)퀵배너A-H거치대
            // 9405 - 실내용 퀵배너B
            199 => 21,  // 퀵배너B-H → (실내)퀵배너B-H거치대
            // 9510 - 워킹배너
            47 => 33,   // 워킹배너(X형) → (실외)워킹배너(X형)거치대
            // 9408 - 롤업배너-H: all sizes have erp_option_id set by SeedDynamicSizeOptions
            // H(060)→26, H(085)→27, H(100)→28, H(120)→29, H(150)→30
        ];

        foreach ($mappings as $sizeId => $erpOptionId) {
            DB::table('erp_size_options')
                ->where('id', $sizeId)
                ->whereNull('erp_option_id') // only update if not already set
                ->update(['erp_option_id' => $erpOptionId]);
        }

        $this->command->info('fixMissingSizeErpOptionIds: '.count($mappings).' size rows updated');
    }

    /**
     * Group 5: Set default_option_id on pivot table for products that need
     * 추가후가공(OP909) or 추가물품(OP910) to default to 선택안함(id=143).
     *
     * Products:
     * - 2003, 2005, 2314, 2012: OP909 default=선택안함, OP910 default=선택안함
     * - 2413, 1123, 2205: OP910 default=선택안함 only
     * - 2004: OP909 default=선택안함 only
     */
    protected function fixDefaultOptions(): void
    {
        $noneOptionId = DB::table('erp_options')->where('code', '91069')->value('id'); // 선택안함 (id=143)
        $op909GroupId = DB::table('erp_option_groups')->where('code', 'OP909')->value('id');
        $op910GroupId = DB::table('erp_option_groups')->where('code', 'OP910')->value('id');

        // For OP910: option 143 (선택안함/91069) belongs to OP910 group in erp_options,
        // so it can be used as default_option_id AND mapped in order_code_erp_option.
        //
        // For OP909: option 143 belongs to OP910, NOT OP909 — so we cannot use default_option_id=143.
        // Instead use default_is_none=true which tells frontend "no selection" is the default.

        // OP910 defaults — use default_option_id=143 + ensure option is mapped
        $op910Defaults = ['2003', '2005', '2314', '2012', '2413', '1123', '2205'];

        foreach ($op910Defaults as $orderCode) {
            $mapping = DB::table('order_code_option_mappings')->where('order_code', $orderCode)->first();
            if (! $mapping) {
                $this->command->warn("{$orderCode}: no mapping found, skipping");

                continue;
            }

            // Set default_option_id on pivot
            DB::table('order_code_erp_option_group')
                ->where('order_code_id', $mapping->id)
                ->where('erp_option_group_id', $op910GroupId)
                ->update(['default_option_id' => $noneOptionId]);

            // Ensure 선택안함 is mapped in order_code_erp_option
            $alreadyMapped = DB::table('order_code_erp_option')
                ->where('order_code_id', $mapping->id)
                ->where('erp_option_id', $noneOptionId)
                ->exists();

            if (! $alreadyMapped) {
                DB::table('order_code_erp_option')->insert([
                    'order_code_id' => $mapping->id,
                    'erp_option_id' => $noneOptionId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->command->info("{$orderCode}: OP910 선택안함 mapped + default set");
            } else {
                $this->command->info("{$orderCode}: OP910 선택안함 already mapped (no change)");
            }
        }

        // OP909 defaults — use default_is_none=true (option 143 belongs to OP910, not OP909)
        $op909NoneDefaults = ['2003', '2005', '2314', '2012', '2004', '9408'];

        foreach ($op909NoneDefaults as $orderCode) {
            $mapping = DB::table('order_code_option_mappings')->where('order_code', $orderCode)->first();
            if (! $mapping) {
                $this->command->warn("{$orderCode}: no mapping found, skipping");

                continue;
            }

            $updated = DB::table('order_code_erp_option_group')
                ->where('order_code_id', $mapping->id)
                ->where('erp_option_group_id', $op909GroupId)
                ->update(['default_is_none' => true, 'default_option_id' => null]);

            $this->command->info("{$orderCode}: OP909 default_is_none=true".($updated ? '' : ' (no change)'));
        }
    }

    /**
     * Group 7: Set coating (OP906) default to 코팅없음 (virtual) for 2201, 2206, 2205, 2314.
     * Uses default_is_none=true flag on the pivot row.
     * Note: 2205 has no OP906 group — fixMissingOp906Groups() adds it first.
     * Note: 2314 has real coating options (쿨코팅 무광/유광) but default should be 코팅없음.
     */
    protected function fixCoatingDefaults(): void
    {
        $op906GroupId = DB::table('erp_option_groups')->where('code', 'OP906')->value('id');

        $codes = ['2201', '2206', '2205', '2314'];
        foreach ($codes as $orderCode) {
            $mapping = DB::table('order_code_option_mappings')->where('order_code', $orderCode)->first();
            if (! $mapping) {
                $this->command->warn("{$orderCode}: no mapping found, skipping");

                continue;
            }

            $updated = DB::table('order_code_erp_option_group')
                ->where('order_code_id', $mapping->id)
                ->where('erp_option_group_id', $op906GroupId)
                ->update(['default_is_none' => true]);

            if ($updated) {
                $this->command->info("{$orderCode}: OP906 default_is_none=true (코팅없음 is default)");
            } else {
                $this->command->info("{$orderCode}: OP906 default_is_none already set (no change)");
            }
        }
    }

    /**
     * 9508 - 아이폴100
     * OP910 default = 단면거치대 (id=46), matching the default size (단면, id=204).
     */
    protected function fix9508DefaultOption(): void
    {
        $mapping = DB::table('order_code_option_mappings')->where('order_code', '9508')->first();
        if (! $mapping) {
            $this->command->warn('9508: no mapping found, skipping');

            return;
        }

        $op910GroupId = DB::table('erp_option_groups')->where('code', 'OP910')->value('id');

        // Default size is 단면(id=204) → erp_option_id=46 (아이폴100-H(단면)거치대)
        DB::table('order_code_erp_option_group')
            ->where('order_code_id', $mapping->id)
            ->where('erp_option_group_id', $op910GroupId)
            ->update(['default_option_id' => 46]);

        $this->command->info('9508: OP910 default_option_id=46 (아이폴100-H(단면)거치대)');
    }

    /**
     * 5105/5106 - 플라잉배너S형/F형
     * Fix double-encoded additional_widths/heights: '"[]"' → '[]'
     * These products use dropdown size selection (12 sizes), no additional widths/heights needed.
     * The double-encoding causes JSON parse errors in buildSizeData().
     */
    protected function fix5105And5106AdditionalWidths(): void
    {
        foreach (['5105', '5106'] as $orderCode) {
            // Use whereRaw to match the double-encoded value '"[]"' stored in DB
            $updated = DB::table('erp_size_options')
                ->where('order_code', $orderCode)
                ->where(function ($q) {
                    $q->whereRaw("additional_widths = '\"[]\"'")
                        ->orWhereRaw("additional_heights = '\"[]\"'");
                })
                ->update([
                    'additional_widths' => '[]',
                    'additional_heights' => '[]',
                ]);

            $this->command->info("{$orderCode}: fixed double-encoded additional_widths/heights on {$updated} rows");
        }
    }

    /**
     * 5106 - 플라잉배너F형
     * Fix working_width/height to match DTPIA production standard:
     * - 대: 1100×3800 (was 800×3800)
     * - 중: 1050×2700 (was 700×3000)
     * - 소: 760×1800  (was 650×1950)
     *
     * 5105 (S형) sizes are correct: 대=800×3800, 중=700×3000, 소=650×1950
     */
    protected function fix5106Sizes(): void
    {
        $tiers = [
            ['prefix' => '대', 'w' => 1100, 'h' => 3800],
            ['prefix' => '중', 'w' => 1050, 'h' => 2700],
            ['prefix' => '소', 'w' => 760, 'h' => 1800],
        ];

        foreach ($tiers as $tier) {
            $updated = DB::table('erp_size_options')
                ->where('order_code', '5106')
                ->where('name', 'like', '플라잉배너F형('.$tier['prefix'].'-%')
                ->update([
                    'working_width' => $tier['w'],
                    'working_height' => $tier['h'],
                    'cutting_width' => $tier['w'],
                    'cutting_height' => $tier['h'],
                ]);

            $this->command->info("5106 {$tier['prefix']}: {$updated} rows → {$tier['w']}×{$tier['h']}");
        }
    }

    /**
     * 1123 - 현수막/족자봉
     * Set OP908 (기본후가공) default = 원형족자봉 (id=141).
     * Legacy CSV confirms: OP908 options are 원형족자봉/사각족자봉 only.
     * Note: "사방" is OP909 (추가후가공), not OP908. 1123 has no OP909 group.
     */
    protected function fix1123DefaultOp908(): void
    {
        $mapping = DB::table('order_code_option_mappings')->where('order_code', '1123')->first();
        if (! $mapping) {
            $this->command->warn('1123: no mapping found, skipping');

            return;
        }

        $op908GroupId = DB::table('erp_option_groups')->where('code', 'OP908')->value('id');

        // 원형족자봉 id=141 (code=90802)
        DB::table('order_code_erp_option_group')
            ->where('order_code_id', $mapping->id)
            ->where('erp_option_group_id', $op908GroupId)
            ->update(['default_option_id' => 141]);

        $this->command->info('1123: OP908 default_option_id=141 (원형족자봉)');
    }

    /**
     * Issue 3: 2412 - 포맥스 포스터
     * Excel data (updated): OP903 (합지), OP904 (잉크), OP907 (재단)
     * - OP903: 포맥스(백색1T/2T/3T/5T) - create NEW options 90311-90314 under OP903
     * - OP904: 90401 (UV(1way))
     * - OP907: 90702-90705 (사각재단, 모양재단 상/중/하)
     *
     * Note: Options 90507-90510 exist under OP905 (used by 2008, 9302, 9303).
     * We create NEW options under OP903 to avoid breaking other order codes.
     */
    protected function fix2412MissingOptions(): void
    {
        $mapping = DB::table('order_code_option_mappings')->where('order_code', '2412')->first();
        if (! $mapping) {
            $this->command->warn('2412: no mapping found, skipping');

            return;
        }

        $op903GroupId = DB::table('erp_option_groups')->where('code', 'OP903')->value('id');

        // 1. Remove wrong options from 2412 mapping
        $wrongOptionIds = DB::table('erp_options')
            ->whereIn('code', ['90309', '90310', '90311', '90312', '90313', '90314'])
            ->pluck('id')
            ->toArray();

        if (! empty($wrongOptionIds)) {
            DB::table('order_code_erp_option')
                ->where('order_code_id', $mapping->id)
                ->whereIn('erp_option_id', $wrongOptionIds)
                ->delete();
            $this->command->info('2412: removed wrong options 90309, 90310');
        }

        // 2. Remove OP905 group and its options from 2412 mapping
        $op905GroupId = DB::table('erp_option_groups')->where('code', 'OP905')->value('id');
        $op905OptionIds = DB::table('erp_options')
            ->where('erp_option_group_id', $op905GroupId)
            ->pluck('id')
            ->toArray();

        if (! empty($op905OptionIds)) {
            DB::table('order_code_erp_option')
                ->where('order_code_id', $mapping->id)
                ->whereIn('erp_option_id', $op905OptionIds)
                ->delete();
        }

        // Remove OP905 group from pivot
        DB::table('order_code_erp_option_group')
            ->where('order_code_id', $mapping->id)
            ->where('erp_option_group_id', $op905GroupId)
            ->delete();

        $this->command->info('2412: removed OP905 group and options');

        // 3. Ensure OP903 group is mapped
        $hasOp903 = DB::table('order_code_erp_option_group')
            ->where('order_code_id', $mapping->id)
            ->where('erp_option_group_id', $op903GroupId)
            ->exists();

        if (! $hasOp903) {
            DB::table('order_code_erp_option_group')->insert([
                'order_code_id' => $mapping->id,
                'erp_option_group_id' => $op903GroupId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->command->info('2412: OP903 group added');
        }

        // 4. Ensure options 90342-90344, 90315 exist under OP903 for 포맥스
        // (matches data-example.xlsx rows 450-453)
        $newMaterials = [
            ['code' => '90342', 'label' => '포맥스(백색1T)', 'price' => 15000],
            ['code' => '90343', 'label' => '포맥스(백색2T)', 'price' => 19000],
            ['code' => '90344', 'label' => '포맥스(백색3T)', 'price' => 29000],
            ['code' => '90315', 'label' => '포맥스(백색5T)', 'price' => 59000],
        ];

        foreach ($newMaterials as $mat) {
            // Check if option already exists
            $optionId = DB::table('erp_options')->where('code', $mat['code'])->value('id');

            if (! $optionId) {
                // Create new option under OP903
                $optionId = DB::table('erp_options')->insertGetId([
                    'erp_option_group_id' => $op903GroupId,
                    'code' => $mat['code'],
                    'label' => $mat['label'],
                    'value' => $mat['label'],
                    'additional_price' => $mat['price'],
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->command->info("2412: created option {$mat['code']} ({$mat['label']})");
            }

            // Map option to 2412
            $alreadyMapped = DB::table('order_code_erp_option')
                ->where('order_code_id', $mapping->id)
                ->where('erp_option_id', $optionId)
                ->exists();

            if (! $alreadyMapped) {
                DB::table('order_code_erp_option')->insert([
                    'order_code_id' => $mapping->id,
                    'erp_option_id' => $optionId,
                    'product_type_condition' => null,
                    'osrc_um' => $mat['price'],
                ]);
                $this->command->info("2412: mapped {$mat['label']}");
            }
        }

        // 5. Ensure OP904 and OP907 groups are mapped
        foreach (['OP904', 'OP907'] as $groupCode) {
            $groupId = DB::table('erp_option_groups')->where('code', $groupCode)->value('id');
            if (! $groupId) {
                continue;
            }

            $exists = DB::table('order_code_erp_option_group')
                ->where('order_code_id', $mapping->id)
                ->where('erp_option_group_id', $groupId)
                ->exists();

            if (! $exists) {
                DB::table('order_code_erp_option_group')->insert([
                    'order_code_id' => $mapping->id,
                    'erp_option_group_id' => $groupId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->command->info("2412: {$groupCode} group added");
            }
        }

        // 6. Map correct options from Excel
        $correctOptions = [
            '90401', // OP904: UV(1way)
            '90702', '90703', '90704', '90705', // OP907: 재단
        ];

        foreach ($correctOptions as $code) {
            $optionId = DB::table('erp_options')->where('code', $code)->value('id');
            if (! $optionId) {
                continue;
            }

            $alreadyMapped = DB::table('order_code_erp_option')
                ->where('order_code_id', $mapping->id)
                ->where('erp_option_id', $optionId)
                ->exists();

            if (! $alreadyMapped) {
                DB::table('order_code_erp_option')->insert([
                    'order_code_id' => $mapping->id,
                    'erp_option_id' => $optionId,
                    'product_type_condition' => null,
                    'osrc_um' => null,
                ]);
                $this->command->info("2412: mapped option {$code}");
            }
        }

        $this->command->info('2412: fix completed');
    }

    /**
     * Issue 4: 2201, 2206, 2314 - OP906 (코팅) phải rỗng (không cho chọn)
     * Remove ALL OP906 options from order_code_erp_option for these codes.
     * API will return empty options array → frontend hides OP906 group.
     */
    protected function fix2201_2206_2314RemoveOp906(): void
    {
        $op906GroupId = DB::table('erp_option_groups')->where('code', 'OP906')->value('id');

        $codes = ['2201', '2206', '2314'];
        foreach ($codes as $orderCode) {
            $mapping = DB::table('order_code_option_mappings')->where('order_code', $orderCode)->first();
            if (! $mapping) {
                $this->command->warn("{$orderCode}: no mapping found, skipping");

                continue;
            }

            // Get all OP906 option IDs
            $op906OptionIds = DB::table('erp_options')
                ->where('erp_option_group_id', $op906GroupId)
                ->pluck('id')
                ->toArray();

            if (! empty($op906OptionIds)) {
                $deleted = DB::table('order_code_erp_option')
                    ->where('order_code_id', $mapping->id)
                    ->whereIn('erp_option_id', $op906OptionIds)
                    ->delete();

                $this->command->info("{$orderCode}: removed {$deleted} OP906 options from mapping");
            }

            // Also set default_is_none = true on pivot as safety measure
            DB::table('order_code_erp_option_group')
                ->where('order_code_id', $mapping->id)
                ->where('erp_option_group_id', $op906GroupId)
                ->update(['default_is_none' => true, 'default_option_id' => null]);
        }
    }

    /**
     * Issue 5: 1123 - 현수막/족자봉
     * OP910 (추가물품) default = 선택안함 (id=143).
     * fixDefaultOptions() already includes 1123 in $op910Defaults list,
     * but this method explicitly ensures it for clarity.
     */
    protected function fix1123DefaultOp910(): void
    {
        $mapping = DB::table('order_code_option_mappings')->where('order_code', '1123')->first();
        if (! $mapping) {
            $this->command->warn('1123: no mapping found, skipping');

            return;
        }

        $op910GroupId = DB::table('erp_option_groups')->where('code', 'OP910')->value('id');
        $noneOptionId = DB::table('erp_options')->where('code', '91069')->value('id'); // 선택안함

        if (! $noneOptionId) {
            $this->command->warn('1123: 선택안함 option (91069) not found, skipping');

            return;
        }

        // Set default_option_id on pivot
        $updated = DB::table('order_code_erp_option_group')
            ->where('order_code_id', $mapping->id)
            ->where('erp_option_group_id', $op910GroupId)
            ->update(['default_option_id' => $noneOptionId]);

        // Ensure 선택안함 is mapped
        $alreadyMapped = DB::table('order_code_erp_option')
            ->where('order_code_id', $mapping->id)
            ->where('erp_option_id', $noneOptionId)
            ->exists();

        if (! $alreadyMapped) {
            DB::table('order_code_erp_option')->insert([
                'order_code_id' => $mapping->id,
                'erp_option_id' => $noneOptionId,
                'product_type_condition' => null,
                'osrc_um' => null,
            ]);
            $this->command->info('1123: OP910 선택안함 mapped + default set');
        } else {
            $this->command->info('1123: OP910 default_option_id='.$noneOptionId.' (선택안함)'.($updated ? ' [updated]' : ' [already set]'));
        }
    }
}
