<?php

namespace App\Services\WebhookOrder;

use App\Models\SizeOption;
use App\Services\SizeLimitService;

class WebhookProductService
{
    public function __construct(
        protected SizeLimitService $sizeLimitService,
    ) {}

    /**
     * Build the serializable size data array for a SizeOption model.
     */
    public function buildSizeData(SizeOption $size, string $orderCode): array
    {
        $isCustomInput = $size->is_custom_input_allowed ?? false;

        $rawW = is_array($size->additional_widths)
            ? $size->additional_widths
            : (json_decode($size->additional_widths ?? 'null', true) ?? []);
        $rawH = is_array($size->additional_heights)
            ? $size->additional_heights
            : (json_decode($size->additional_heights ?? 'null', true) ?? []);

        $hasMultiW = count($rawW) > 1
            || (count($rawW) === 1 && (int) $rawW[0] !== (int) $size->working_width);
        $hasMultiH = count($rawH) > 1
            || (count($rawH) === 1 && (int) $rawH[0] !== (int) $size->working_height);

        $additionalWidths = empty($rawW) ? [(int) $size->working_width] : $rawW;
        $additionalHeights = empty($rawH) ? [(int) $size->working_height] : $rawH;

        $totalSizes = SizeOption::where('order_code', $size->order_code)->count();

        $sizeSelectionType = match (true) {
            $isCustomInput => 'custom_input',
            $hasMultiW || $hasMultiH => 'additional_options',
            $totalSizes === 1 => 'fixed',
            default => 'dropdown',
        };

        $showSizeSelector = ! in_array($sizeSelectionType, ['fixed', 'custom_input']);
        $showWidthDropdown = $sizeSelectionType === 'additional_options' && $hasMultiW;
        $showHeightDropdown = $sizeSelectionType === 'additional_options' && $hasMultiH;

        // size_ratio: 10 = working size is 1/10 of cutting size (large-format products, 1500 ppi)
        //             100 = working size equals cutting size (standard products, 150 ppi)
        $sizeRatio = (int) ($size->size_ratio ?? 100);
        $ppi = $sizeRatio === 10 ? 1500 : 150;

        return [
            'id' => $size->id,
            'label' => $size->name,
            'cutting_width' => (int) $size->cutting_width,
            'cutting_height' => (int) $size->cutting_height,
            'width' => (int) $size->working_width,
            'height' => (int) $size->working_height,
            'size_ratio' => $sizeRatio,
            'ppi' => $ppi,
            'is_default' => $size->is_default,
            'size_type' => $size->size_type ?? 'standard',
            'additional_widths' => $additionalWidths,
            'additional_heights' => $additionalHeights,
            'is_custom_input_allowed' => $isCustomInput,
            'size_selection_type' => $sizeSelectionType,
            'show_size_selector' => $showSizeSelector,
            'show_width_dropdown' => $showWidthDropdown,
            'show_height_dropdown' => $showHeightDropdown,
            'min_width' => $size->min_width,
            'max_width' => $size->max_width,
            'min_height' => $size->min_height,
            'max_height' => $size->max_height,
            'width_step' => $size->width_step ?? 1,
            'height_step' => $size->height_step ?? 1,
            'erp_option_id' => $size->erp_option_id,
            'editor_permission' => $isCustomInput,
        ];
    }

    /**
     * Resolve size limits for a given order code and selected size.
     */
    public function getSizeLimits(string $orderCode, ?SizeOption $selectedSize, ?string $materialLabel = null): ?array
    {
        if ($orderCode === '2413' && $selectedSize) {
            return $this->sizeLimitService->getSizeLimitsFor2413((float) $selectedSize->working_width);
        }
        if ($orderCode === '2420' && $selectedSize) {
            return $this->sizeLimitService->getSizeLimitsFor2420((float) $selectedSize->working_height);
        }
        if ($orderCode === '2016') {
            return $this->sizeLimitService->getSizeLimitsFor2016($materialLabel);
        }

        return $this->sizeLimitService->getSizeLimits(null, $orderCode);
    }

    /**
     * Return all popup warning image URLs for an order code as an array.
     * Scans for: {orderCode}_pop_order_warning.jpg, {orderCode}_pop_order_2.jpg, _pop_order_3.jpg, ...
     * Returns an empty array if no popup images exist.
     */
    public function getPopupImages(string $orderCode): array
    {
        $images = [];

        // First image: {orderCode}_pop_order_warning.jpg
        $first = "{$orderCode}_pop_order_warning.jpg";
        if (file_exists(public_path("images/popups/{$first}"))) {
            $images[] = asset("images/popups/{$first}");
        }

        // Additional images: {orderCode}_pop_order_2.jpg, _pop_order_3.jpg, ...
        for ($i = 2; $i <= 10; $i++) {
            $filename = "{$orderCode}_pop_order_{$i}.jpg";
            if (file_exists(public_path("images/popups/{$filename}"))) {
                $images[] = asset("images/popups/{$filename}");
            } else {
                break;
            }
        }

        return $images;
    }

    /**
     * Return the product rules array for a given order code.
     * These rules drive frontend UI behaviour (alerts, auto-set options, quantity config, etc.).
     */
    public function getProductRules(string $orderCode, array $activeGroupCodes = []): array
    {
        // Order codes where 재단수량 (cutting quantity) input is hidden entirely
        $hideCuttingQty = ['2426', '2010', '9105'];

        // Lock cutting quantity to 1 when OP907 option label contains any of these strings
        $cuttingQtyDisabledWhen = ['사각재단', '텐션용'];

        $rules = [
            '2009' => [[
                'type' => 'set_option',
                'trigger_group_code' => 'OP903',
                'trigger_option_code' => '90308',
                'target_group_code' => 'OP906',
                'target_option_code' => '90602',
            ]],
            '9103' => [[
                'type' => 'set_option',
                'trigger_group_code' => 'OP903',
                'trigger_option_code' => '90308',
                'target_group_code' => 'OP906',
                'target_option_code' => '90602',
            ]],
            '9501' => [[
                'type' => 'show_alert',
                'trigger_group_code' => 'OP903',
                'trigger_option_codes' => ['90305', '90306'],
                'message' => '5000*1160 이내만 출력가능합니다',
                'reset_size' => ['width' => 500, 'height' => 500],
            ]],
            '9507' => [[
                'type' => 'show_alert',
                'trigger_group_code' => 'OP903',
                'trigger_option_codes' => ['90305', '90306'],
                'message' => '5000*1160 이내만 출력가능합니다',
                'reset_size' => ['width' => 500, 'height' => 500],
            ]],
            // 준드로 완컷 재단됩니다 — show when OP907 (재단) has any value selected
            '2001' => [[
                'type' => 'show_cutting_note',
                'trigger_group_code' => 'OP907',
                'message' => '준드로 완컷 재단됩니다.',
            ]],
            '2002' => [[
                'type' => 'show_cutting_note',
                'trigger_group_code' => 'OP907',
                'message' => '준드로 완컷 재단됩니다.',
            ]],
            '2013' => [[
                'type' => 'show_cutting_note',
                'trigger_group_code' => 'OP907',
                'message' => '준드로 완컷 재단됩니다.',
            ]],
            '2201' => [[
                'type' => 'show_cutting_note',
                'trigger_group_code' => 'OP907',
                'message' => '준드로 완컷 재단됩니다.',
            ]],
        ];

        $result = $rules[$orderCode] ?? [];

        // cutting_quantity — applies to all order codes
        $result[] = [
            'type' => 'cutting_quantity',
            'show' => ! in_array($orderCode, $hideCuttingQty),
            'disabled_when' => $cuttingQtyDisabledWhen,
            'trigger_group_code' => 'OP907',
            'min' => 1,
        ];

        // option_quantity_config — controls qty inputs for OP909 / OP910
        // OP909 (추가후가공): dropdown only, no qty input
        // OP910 (추가물품): always show qty, syncs with order qty
        //   special_rules drive per-option overrides:
        //     - multiplier: qty value = order_qty × multiplier
        //     - disabled: input is locked (user cannot edit)
        //   9107 + 큐방: qty = order_qty × 4, input disabled (legacy: $opt7_1.attr("disabled", true))
        // Value format sent to ERP: "{option_label}/{qty}개"  e.g. "큐방/4개"
        $result[] = [
            'type' => 'option_quantity_config',
            'groups' => [
                'OP909' => [
                    'group_code' => 'OP909',
                    'show_quantity' => false,
                    'sync_with_order_qty' => false,
                    'special_rules' => [],
                ],
                'OP910' => [
                    'group_code' => 'OP910',
                    'show_quantity' => true,
                    'sync_with_order_qty' => true,
                    'special_rules' => $orderCode === '9107'
                        ? [['option_label' => '큐방', 'multiplier' => 4, 'disabled' => true]]
                        : [],
                ],
            ],
        ];

        /*
         * eyelet_config — TODO: not yet needed, commented out for now.
         *
         * OP908 options containing '고리' → 8-position count grid (상좌/상/상우/좌/우/하좌/하/하우).
         * Value format: "{option_label}/{pos}{count},..."  e.g. "쇠고리/상20,상우1,하20,하우1"
         * option_overrides: '사방' → 4 corners preset=1 all disabled; '우측끈고리' → only 우; '좌측끈고리' → only 좌
         *
         * $result[] = [
         *     'type'               => 'eyelet_config',
         *     'trigger_group_code' => 'OP908',
         *     'trigger_condition'  => 'label_contains',
         *     'trigger_value'      => '고리',
         *     'ui_type'            => 'eyelet_grid',
         *     'value_format'       => '{option_label}/{pos}{count},{pos}{count},...',
         *     'positions'          => [
         *         ['key' => '상좌', 'label' => '상좌', 'default_count' => 0],
         *         ['key' => '상',   'label' => '상',   'default_count' => 0],
         *         ['key' => '상우', 'label' => '상우', 'default_count' => 0],
         *         ['key' => '좌',   'label' => '좌',   'default_count' => 0],
         *         ['key' => '우',   'label' => '우',   'default_count' => 0],
         *         ['key' => '하좌', 'label' => '하좌', 'default_count' => 0],
         *         ['key' => '하',   'label' => '하',   'default_count' => 0],
         *         ['key' => '하우', 'label' => '하우', 'default_count' => 0],
         *     ],
         *     'option_overrides' => [
         *         ['match' => 'label_contains', 'value' => '사방',    'preset_counts' => ['상좌' => 1, '상우' => 1, '하좌' => 1, '하우' => 1], 'disabled_positions' => ['상좌','상','상우','좌','우','하좌','하','하우']],
         *         ['match' => 'label_equals',   'value' => '우측끈고리', 'preset_counts' => [], 'disabled_positions' => ['상좌','상','상우','좌','하좌','하','하우']],
         *         ['match' => 'label_equals',   'value' => '좌측끈고리', 'preset_counts' => [], 'disabled_positions' => ['상좌','상','상우','우','하좌','하','하우']],
         *     ],
         * ];
         */

        // option_checkboxes — only emitted when OP908 is actually present for this order code.
        //
        // Shared positions: 상/하/좌/우 (all default_count = 1).
        // Triggers are resolved per-orderCode so each product gets its own explicit defaults.
        //
        // Per-orderCode trigger overrides:
        //   1123 (현수막족자봉) — 족자봉: 상/하 pre-checked, all 4 disabled (locked)
        //   5105/5106 (플라잉배너S/F형) — 윈드배너가공: all 4 checked + locked, min 4
        //   default — 족자봉: min 4, 사방 override locks all 4
        if (in_array('OP908', $activeGroupCodes)) {
            $allDirections = [
                ['key' => '상', 'label' => '상', 'default_count' => 1],
                ['key' => '하', 'label' => '하', 'default_count' => 1],
                ['key' => '좌', 'label' => '좌', 'default_count' => 1],
                ['key' => '우', 'label' => '우', 'default_count' => 1],
            ];

            $result[] = [
                'type' => 'option_checkboxes',
                'trigger_group_code' => 'OP908',
                // 'value_format'       => '{option_label}/{pos}{count},{pos}{count},...',
                'positions' => $allDirections,
                'triggers' => $this->resolveDirectionTriggers($orderCode),
            ];
        }

        return $result;
    }

    /**
     * Return the direction_config triggers for a given order code.
     *
     * Each trigger matches an OP908 option label and declares:
     *   - match / value: how to identify the option
     *   - min_positions: minimum number of directions that must be selected
     *   - default_checked_keys: which directions are pre-checked
     *   - option_overrides: per-option overrides (e.g. '사방' locks all 4)
     */
    private function resolveDirectionTriggers(string $orderCode): array
    {
        // 족자봉 trigger — shared base, min_positions and option_overrides vary by order code
        $jokjabongBase = [
            'match' => 'option_label_contains',
            'value' => '족자봉',
            'default_checked_keys' => ['상', '하'],
            'disabled_positions' => ['상', '하', '좌', '우'],
        ];

        // 1123 (현수막족자봉): only 상/하 required, no 사방 override
        if ($orderCode === '1123') {
            return [$jokjabongBase];
        }

        // Default: 5105/5106 (플라잉배너S형/F형): 윈드배너가공 trigger, all 4 checked

        return [[
            'match' => 'option_label_contains',
            'value' => '윈드배너가공',
            // 'min_positions'        => 4,
            'default_checked_keys' => ['상', '하', '좌', '우'],
            'disabled_positions' => ['상', '하', '좌', '우'],
        ]];
    }
}
