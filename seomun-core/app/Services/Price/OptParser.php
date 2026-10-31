<?php

namespace App\Services\Price;

/**
 * Shared parser for opt field values used in price calculation and ERP transformation.
 *
 * Opt value formats (from legacy frontend):
 *   - Plain label:              "패트(수성)"
 *   - With quantity:            "(빅배너)플라잉배너S형(대-물통)거치대/1개"
 *   - With cutting info:        "사각재단/0mm/1장"
 *   - With position data:       "윈드배너가공S형/상,하,좌,우"
 *   - With eyelet positions:    "사방쇠고리/상좌1,상1,상우1,하좌1,하우1"
 *   - Comma-merged (opt9→opt7): "(빅배너)거치대A/1개,(빅배너)거치대B/2개"
 */
class OptParser
{
    /**
     * Parse a single opt value string into structured data.
     *
     * Returns:
     *   name     — the option label to match against erp_options.label
     *   quantity — integer qty if present (e.g. "/1개"), null otherwise
     *   metadata — raw string after first "/" (position data, cutting info, etc.)
     */
    public static function parseOne(string $optValue): array
    {
        $optValue = trim($optValue);

        // Format: "{label}/{qty}개"  e.g. "거치대/1개"
        if (preg_match('/^(.*?)\/(\d+)개$/', $optValue, $matches)) {
            return [
                'name' => trim($matches[1]),
                'quantity' => (int) $matches[2],
                'metadata' => null,
            ];
        }

        // Format: "{label}/{anything}"  e.g. "사각재단/0mm/1장", "윈드배너가공S형/상,하,좌,우"
        if (str_contains($optValue, '/')) {
            $slashPos = strpos($optValue, '/');

            return [
                'name' => trim(substr($optValue, 0, $slashPos)),
                'quantity' => null,
                'metadata' => trim(substr($optValue, $slashPos + 1)),
            ];
        }

        // Plain label — no slash
        return [
            'name' => $optValue,
            'quantity' => null,
            'metadata' => null,
        ];
    }

    /**
     * Parse an opt value that may contain comma-merged sub-items.
     *
     * Legacy frontend merges opt9 into opt7 with a comma:
     *   "거치대A/1개,거치대B/2개"
     *
     * Returns an array of parsed items (usually 1, sometimes 2+).
     *
     * @return array<int, array{name: string, quantity: int|null, metadata: string|null}>
     */
    public static function parseAll(string $optValue): array
    {
        $parts = explode(',', $optValue);
        $results = [];

        foreach ($parts as $part) {
            $part = trim($part);
            if ($part === '') {
                continue;
            }
            $results[] = self::parseOne($part);
        }

        return $results;
    }

    /**
     * Extract just the label name from an opt value (strips quantity and metadata).
     * Handles comma-merged values by returning only the first item's name.
     */
    public static function extractName(string $optValue): string
    {
        $first = trim(explode(',', $optValue)[0]);

        return self::parseOne($first)['name'];
    }
}
