<?php

namespace App\Enums;

enum ProductSpecificationOption: string
{
    // paper_type
    case PAPER_HOLO_WHITE = 'holo-white';
    case PAPER_WHITE_PAPER = 'white-paper';
    case PAPER_IMITATION = 'imitation';

    // print_side
    case PRINT_DOUBLE = 'double';
    case PRINT_SINGLE = 'single';

    // coating
    case COATING_NONE = 'none';
    case COATING_NORMAL = 'normal';
    case COATING_PREMIUM = 'premium';

    // corner_finish
    case CORNER_ROUND = 'round';
    case CORNER_SQUARE = 'square';

    /**
     * @return array<int, string>
     */
    public static function paperTypes(): array
    {
        return [
            self::PAPER_HOLO_WHITE->value,
            self::PAPER_WHITE_PAPER->value,
            self::PAPER_IMITATION->value,
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function printSides(): array
    {
        return [
            self::PRINT_DOUBLE->value,
            self::PRINT_SINGLE->value,
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function coatings(): array
    {
        return [
            self::COATING_NONE->value,
            self::COATING_NORMAL->value,
            self::COATING_PREMIUM->value,
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function cornerFinishes(): array
    {
        return [
            self::CORNER_ROUND->value,
            self::CORNER_SQUARE->value,
        ];
    }

    public static function normalizePaperType(?string $value): string
    {
        $normalized = strtolower(trim((string) $value));

        return in_array($normalized, self::paperTypes(), true)
            ? $normalized
            : self::PAPER_HOLO_WHITE->value;
    }

    public static function normalizePrintSide(?string $value): string
    {
        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            'both', '양면' => self::PRINT_DOUBLE->value,
            'one', '단면' => self::PRINT_SINGLE->value,
            default => in_array($normalized, self::printSides(), true)
                ? $normalized
                : self::PRINT_DOUBLE->value,
        };
    }

    public static function normalizeCoating(?string $value): string
    {
        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            'matte', 'glossy', 'coating_none', '비코팅' => self::COATING_NONE->value,
            'coating_matte', '무광', '무광 코팅' => self::COATING_NORMAL->value,
            'coating_glossy', '유광', '유광 코팅' => self::COATING_PREMIUM->value,
            default => in_array($normalized, self::coatings(), true)
                ? $normalized
                : self::COATING_NONE->value,
        };
    }

    public static function normalizeCornerFinish(?string $value): string
    {
        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            'rounded', 'corner_rounded', '코너 라운딩', '라운드' => self::CORNER_ROUND->value,
            'corner_square', '기본 (직각)', '직각' => self::CORNER_SQUARE->value,
            default => in_array($normalized, self::cornerFinishes(), true)
                ? $normalized
                : self::CORNER_SQUARE->value,
        };
    }
}
