<?php

namespace App\Services;

/**
 * Service for handling size limits based on material/option selection.
 *
 * This maps the legacy system's setMargin() validation rules from order_02.js
 * which validate max width/height based on material type (opt1) and order code.
 */
class SizeLimitService
{
    /**
     * Size limits by material label (opt1)
     * Key = material label contains this string
     * Value = [max_width, max_height, message]
     */
    private const MATERIAL_SIZE_LIMITS = [
        '인테리어필름' => [
            'max_width' => 5000,
            'max_height' => 1180,
            'message' => '5000 * 1180 이내만 출력가능합니다.',
        ],
        '반사지' => [
            'max_width' => 5000,
            'max_height' => 1160,
            'message' => '5000 * 1160 이내만 출력가능합니다.',
        ],
        '랩핑지' => [
            'max_width' => 5000,
            'max_height' => 1320,
            'message' => '5000 * 1320 이내만 출력가능합니다.',
        ],
        '바닥시트' => [
            'max_width' => 5000,
            'max_height' => 1200,
            'message' => '5000 * 1200 이내만 출력가능합니다.',
        ],
        '자석시트' => [
            'max_width' => 2380,
            'max_height' => 980,
            'message' => '2380 * 980 이내만 출력가능합니다.',
        ],
        '벽지' => [
            'max_width' => 5000,
            'max_height' => 830,
            'message' => '5000 * 830 이내만 출력가능합니다.',
        ],
        '원웨이필름' => [
            'max_width' => 5000,
            'max_height' => 1320,
            'message' => '5000 * 1320 이내만 출력가능합니다.',
        ],
        'LG시트지' => [
            'max_width' => 5000,
            'max_height' => 1460,
            'message' => '5000 * 1460 이내만 출력가능합니다.',
        ],
        // 시트지(반투명)
        '반투명' => [
            'max_width' => 5000,
            'max_height' => 1220,
            'message' => '5000 * 1220 이내만 출력가능합니다.',
        ],
        // 시트지(조명용)
        '조명용' => [
            'max_width' => 5000,
            'max_height' => 1160,
            'message' => '5000 * 1160 이내만 출력가능합니다.',
        ],
        '엠보' => [
            'max_width' => 5000,
            'max_height' => 1160,
            'message' => '5000 * 1160 이내만 출력가능합니다.',
        ],
        '아크릴' => [
            'max_width' => 1080,
            'max_height' => 880,
            'message' => '1080 * 880 이내만 출력가능합니다.',
        ],
        '포맥스' => [
            'max_width' => 2380,
            'max_height' => 1180,
            'message' => '2380 * 1180 이내만 출력가능합니다.',
        ],
        '폼보드' => [
            'max_width' => 2380,
            'max_height' => 1180,
            'message' => '2380 * 1180 이내만 출력가능합니다.',
        ],
        // For opt6 (합지/후가공) - same limits as 포맥스/폼보드
        '포맥스(합지)' => [
            'max_width' => 2380,
            'max_height' => 1180,
            'message' => '2380 * 1180 이내만 출력가능합니다.',
        ],
        '자석(차량용)' => [
            'max_width' => 2380,
            'max_height' => 980,
            'message' => '2380 * 980 이내만 출력가능합니다.',
        ],
        // 백릿(수성), 백릿(라텍스) - 조명용 category (5000×1160)
        '백릿' => [
            'max_width' => 5000,
            'max_height' => 1160,
            'message' => '5000 * 1160 이내만 출력가능합니다.',
        ],
    ];

    /**
     * Size limits by order code
     * Key = order_code
     * Value = [max_width, max_height, message]
     */
    private const ORDER_CODE_SIZE_LIMITS = [
        '2001' => [
            'max_width' => 5000,
            'max_height' => 1480,
            'message' => '5000 * 1480 이내만 출력가능합니다.', // 유포지
        ],
        '2003' => [
            'max_width' => 5000,
            'max_height' => 1480,
            'message' => '5000 * 1480 이내만 출력가능합니다.', // 패트
        ],
        '2004' => [
            'max_width' => 5000,
            'max_height' => 1480,
            'message' => '5000 * 1480 이내만 출력가능합니다.', // 인화지
        ],
        '2005' => [
            'max_width' => 5000,
            'max_height' => 1480,
            'message' => '5000 * 1480 이내만 출력가능합니다.', // 백릿(조명용)
        ],
        '2203' => [
            'max_width' => 5000,
            'max_height' => 1320,
            'message' => '5000 * 1320 이내만 출력가능합니다.', // 원웨이필름
        ],
        '2204' => [
            'max_width' => 5000,
            'max_height' => 1160,
            'message' => '5000 * 1160 이내만 출력가능합니다.', // 펄반사지/벌집반사지
        ],
        '2205' => [
            'max_width' => 5000,
            'max_height' => 1780,
            'message' => '5000 * 1780 이내만 출력가능합니다.', // 스트립매쉬
        ],
        '2306' => [
            'max_width' => 5000,
            'max_height' => 1480,
            'message' => '5000 * 1480 이내만 출력가능합니다.', // 투명필름(접착)
        ],
        '2309' => [
            'max_width' => 5000,
            'max_height' => 1180,
            'message' => '5000 * 1180 이내만 출력가능합니다.', // 인테리어필름
        ],
        '2314' => [
            'max_width' => 5000,
            'max_height' => 1480,
            'message' => '5000 * 1480 이내만 출력가능합니다.', // 투명필름(비접착)
        ],
        '2009' => [
            'max_width' => 2380,
            'max_height' => 1180,
            'message' => '2380 * 1180 이내만 출력가능합니다.', // 차량용자석
        ],
        '2010' => [
            'max_width' => 5000,
            'max_height' => 2000,
            'message' => '5000 * 2000 이내만 출력가능합니다.', // 어깨띠
        ],
        '2012' => [
            'max_width' => 2390,
            'max_height' => 1230,
            'message' => '2390 * 1230 이내만 출력가능합니다.', // 블록아웃PET
        ],
        '2014' => [
            'max_width' => 2390,
            'max_height' => 1230,
            'message' => '2390 * 1230 이내만 출력가능합니다.', // 블록아웃PET(행사)
        ],
        '2015' => [
            'max_width' => 5000,
            'max_height' => 1480,
            'message' => '5000 * 1480 이내만 출력가능합니다.', // 인화지(행사)
        ],
        '2016' => [
            // 2016 uses opt3 for material (바닥코팅지, 항균코팅지)
            // User confirmed: 5000 * 1240 limit shows in alert
            'max_width' => 5000,
            'max_height' => 1240,
            'message' => '5000 * 1240 이내만 출력가능합니다.', // 바닥시트
        ],
        '9103' => [
            'max_width' => 2380,
            'max_height' => 1180,
            'message' => '2380 * 1180 이내만 출력가능합니다.', // 등신대
        ],
        '2013' => [
            'max_width' => 5000,
            'max_height' => 1480,
            'message' => '5000 * 1480 이내만 출력가능합니다.', // 워터제로PVC
        ],
        '2011' => [
            'max_width' => 5000,
            'max_height' => 1200,
            'message' => '5000 * 1200 이내만 출력가능합니다.', // 배면접착유포지
        ],
        '2417' => [
            'max_width' => 5000,
            'max_height' => 1230,
            'message' => '5000 * 1230 이내만 출력가능합니다.', // 일반시트지
        ],
        '2201' => [
            'max_width' => 5000,
            'max_height' => 1480,
            'message' => '5000 * 1480 이내만 출력가능합니다.', // 시트지
        ],
        '9105' => [
            'max_width' => 600,
            'max_height' => 1700,
            'message' => '600 * 1700 이내만 출력가능합니다.', // 미니등신대
        ],
        '1123' => [
            'max_width' => 2900,
            'max_height' => 10000,
            'default_width' => 600,
            'default_height' => 1000,
            'message' => '가로 2900 이하, 세로 10000 이하만 출력가능합니다.',
        ],
        '2002' => [
            'max_width' => 5000,
            'max_height' => 1480,
            'message' => '5000 * 1480 이내만 출력가능합니다.', // PVC캘지
        ],
        '2008' => [
            'max_width' => 2380,
            'max_height' => 1180,
            'message' => '2380 * 1180 이내만 출력가능합니다.', // 실사출력(일반)
        ],
        '2206' => [
            'max_width' => 5000,
            'max_height' => 1320,
            'message' => '5000 * 1320 이내만 출력가능합니다.', // 랩핑지
        ],
        '2411' => [
            'max_width' => 2380,
            'max_height' => 1180,
            'message' => '2380 * 1180 이내만 출력가능합니다.', // 폼보드 포스터
        ],
        '2412' => [
            'max_width' => 5000,
            'max_height' => 1230,
            'message' => '5000 * 1230 이내만 출력가능합니다.', // 포맥스 포스터
        ],
    ];

    /**
     * Get size limits based on material label and order code
     *
     * @param  string|null  $materialLabel  The selected material label (opt1 or opt6)
     * @param  string|null  $orderCode  The order code
     * @param  string|null  $inkLabel  The selected ink label (opt2) - used for 투명필름 variants
     * @return array|null Returns [max_width, max_height, message] or null if no limits
     */
    public function getSizeLimits(?string $materialLabel, ?string $orderCode = null, ?string $inkLabel = null): ?array
    {
        // First check order code specific limits
        if ($orderCode && isset(self::ORDER_CODE_SIZE_LIMITS[$orderCode])) {
            return self::ORDER_CODE_SIZE_LIMITS[$orderCode];
        }

        // Special case for 2413 (족자봉) - handled separately due to complex rules
        if ($orderCode === '2413') {
            return null; // Will be handled by client-side with special logic
        }

        // Special case for 2420 (플렉스) - handled separately due to complex rules
        if ($orderCode === '2420') {
            return null; // Will be handled by client-side with special logic
        }

        // Then check material based limits
        if ($materialLabel) {
            // 투명필름 (2306: 투명필름(접착), 2314: 투명필름(비접착)) - opt2-dependent limits
            // Legacy: 라텍스 → 5000×1220, UV → 5000×1480
            if (strpos($materialLabel, '투명필름') !== false) {
                if ($inkLabel && strpos($inkLabel, '라텍스') !== false) {
                    return [
                        'max_width' => 5000,
                        'max_height' => 1220,
                        'message' => '5000 * 1220 이내만 출력가능합니다.',
                    ];
                }

                // UV or default
                return [
                    'max_width' => 5000,
                    'max_height' => 1480,
                    'message' => '5000 * 1480 이내만 출력가능합니다.',
                ];
            }

            foreach (self::MATERIAL_SIZE_LIMITS as $key => $limits) {
                if (strpos($materialLabel, $key) !== false) {
                    return $limits;
                }
            }
        }

        return null;
    }

    /**
     * Get size limits for order 2413 (족자봉) based on width
     * Special logic from legacy system:
     * - width <= 1480: max height 10000
     * - width 1480-2900: max height 1480
     * - width > 2900: max width 2900
     *
     * @param  float  $width  The selected width in mm
     * @return array Returns size limits based on width
     */
    public function getSizeLimitsFor2413(float $width): array
    {
        if ($width <= 1480) {
            return [
                'max_width' => 1480,
                'max_height' => 10000,
                'message' => '가로 1480 이하 : 세로 10000 이하만 출력가능합니다.',
            ];
        } elseif ($width <= 2900) {
            return [
                'max_width' => 2900,
                'max_height' => 1480,
                'message' => '가로 1480 ~ 2900 : 세로 1480 이하만 출력가능합니다.',
            ];
        } else {
            return [
                'max_width' => 2900,
                'max_height' => null, // No height limit
                'message' => '가로 2900 까지 출력가능합니다.',
            ];
        }
    }

    /**
     * Get size limits for opt6 (합지/후가공 option)
     *
     * @param  string|null  $opt6Label  The opt6 label
     * @param  string|null  $orderCode  The order code
     */
    public function getOpt6SizeLimits(?string $opt6Label, ?string $orderCode = null): ?array
    {
        // Check order code first
        if ($orderCode && isset(self::ORDER_CODE_SIZE_LIMITS[$orderCode])) {
            return self::ORDER_CODE_SIZE_LIMITS[$orderCode];
        }

        // Check opt6 specific materials
        if ($opt6Label) {
            // 자석(차량용) is in opt6
            if (strpos($opt6Label, '자석') !== false) {
                return self::MATERIAL_SIZE_LIMITS['자석(차량용)'];
            }
            // 포맥스(합지)
            if (strpos($opt6Label, '포맥스') !== false) {
                return self::MATERIAL_SIZE_LIMITS['포맥스(합지)'];
            }
            // 폼보드(합지)
            if (strpos($opt6Label, '폼보드') !== false) {
                return self::MATERIAL_SIZE_LIMITS['폼보드'];
            }
        }

        return null;
    }

    /**
     * Get size limits for order 2420 (플렉스) based on opt4 selection
     * Special logic from legacy system:
     * - 텍션용: max height 3000
     * - 사각재단: max height 1700
     * - Default: max width 20000
     *
     * @param  float  $height  The selected height in mm
     * @param  string|null  $opt4Label  The opt4 label (재단 type)
     * @return array Returns size limits based on opt4 selection
     */
    public function getSizeLimitsFor2420(float $height, ?string $opt4Label = null): array
    {
        // Check opt4 for 텍션용 or 사각재단
        if ($opt4Label) {
            if (strpos($opt4Label, '텍션용') !== false) {
                return [
                    'max_width' => 20000,
                    'max_height' => 3000,
                    'message' => '텍션용-폭3000mm 초과 주문불가',
                ];
            }
            if (strpos($opt4Label, '사각재단') !== false) {
                return [
                    'max_width' => 20000,
                    'max_height' => 1700,
                    'message' => '사각재단-폭1700mm 초과 주문불가',
                ];
            }
        }

        // Default: max width 20000
        return [
            'max_width' => 20000,
            'max_height' => null, // No height limit
            'message' => '폭 3000mm 초과 주문불가',
        ];
    }

    /**
     * Get size limits for order 2016 (바닥시트, 항균코팅지) based on opt3 material
     * Special logic from legacy system:
     * - 바닥코팅지 (바닥시트): max height 1200
     * - 항균코팅지: no specific limit in legacy
     *
     * Note: 2016 uses opt3 for material selection, not opt1
     *
     * @param  string|null  $opt3Label  The opt3 label (material: 바닥코팅지 or 항균코팅지)
     * @return array Returns size limits based on material
     */
    public function getSizeLimitsFor2016(?string $opt3Label = null): array
    {
        // Check opt3 for 바닥코팅지 or 항균코팅지
        if ($opt3Label) {
            // 바닥시트 (바닥코팅지) - has 1240 limit (per user confirmation)
            if (strpos($opt3Label, '바닥') !== false) {
                return [
                    'max_width' => 5000,
                    'max_height' => 1240,
                    'message' => '5000 * 1240 이내만 출력가능합니다.',
                ];
            }
            // 항균코팅지 - no specific limit in legacy, use default
            if (strpos($opt3Label, '항균') !== false) {
                return [
                    'max_width' => 5000,
                    'max_height' => 1480, // General limit from similar products
                    'message' => '5000 * 1480 이내만 출력가능합니다.',
                ];
            }
        }

        // Default for 2016: max_height 1240 (바닥시트 default per user confirmation)
        return [
            'max_width' => 5000,
            'max_height' => 1240,
            'message' => '5000 * 1240 이내만 출력가능합니다.',
        ];
    }
}
