<?php

namespace App\Enums;

enum PaperSizeDivisionCode: string
{
    // National
    case NATIONAL_FULL = 'NATIONAL_FULL';
    case NATIONAL_2 = 'NATIONAL_2';
    case NATIONAL_4 = 'NATIONAL_4';
    case NATIONAL_8 = 'NATIONAL_8';
    case NATIONAL_16 = 'NATIONAL_16';

    // 46
    case SIZE_46_FULL = 'SIZE_46_FULL';
    case SIZE_46_2 = 'SIZE_46_2';
    case SIZE_46_4 = 'SIZE_46_4';
    case SIZE_46_8 = 'SIZE_46_8';
    case SIZE_46_16 = 'SIZE_46_16';

    // Small National
    case SMALL_NATIONAL_FULL = 'SMALL_NATIONAL_FULL';
    case SMALL_NATIONAL_2 = 'SMALL_NATIONAL_2';
    case SMALL_NATIONAL_4 = 'SMALL_NATIONAL_4';
    case SMALL_NATIONAL_8 = 'SMALL_NATIONAL_8';

    public function width(): int
    {
        return match ($this) {
            // National (788 × 1091)
            self::NATIONAL_FULL => 636,
            self::NATIONAL_2 => 636,
            self::NATIONAL_4 => 468,
            self::NATIONAL_8 => 234,
            self::NATIONAL_16 => 159,

            // 46 (636 × 939)
            self::SIZE_46_FULL => 788,
            self::SIZE_46_2 => 788,
            self::SIZE_46_4 => 394,
            self::SIZE_46_8 => 394,
            self::SIZE_46_16 => 197,

            // Small National (636 × 939)
            self::SMALL_NATIONAL_FULL => 625,
            self::SMALL_NATIONAL_2 => 625,
            self::SMALL_NATIONAL_4 => 440,
            self::SMALL_NATIONAL_8 => 220,
        };
    }

    public function height(): int
    {
        return match ($this) {
            // National (788 × 1091)
            self::NATIONAL_FULL => 939,
            self::NATIONAL_2 => 469,
            self::NATIONAL_4 => 317,
            self::NATIONAL_8 => 318,
            self::NATIONAL_16 => 234,

            // 46 (636 × 939)
            self::SIZE_46_FULL => 1091,
            self::SIZE_46_2 => 545,
            self::SIZE_46_4 => 545,
            self::SIZE_46_8 => 272,
            self::SIZE_46_16 => 272,

            // Small National (636 × 939)
            self::SMALL_NATIONAL_FULL => 880,
            self::SMALL_NATIONAL_2 => 440,
            self::SMALL_NATIONAL_4 => 317,
            self::SMALL_NATIONAL_8 => 317,
        };
    }

    public function size(): array
    {
        return [
            'width' => $this->width(),
            'height' => $this->height(),
        ];
    }

    public function label(): string
{
    return match ($this) {
        self::NATIONAL_FULL => '국전 (636×939)',
        self::NATIONAL_2 => '국2절 (636×469)',
        self::NATIONAL_4 => '국4절 (468×317)',
        self::NATIONAL_8 => '국8절 (234×318)',
        self::NATIONAL_16 => '국16절 (159×234)',

        self::SIZE_46_FULL => '사륙 (788×1091)',
        self::SIZE_46_2 => '2절 (788×545)',
        self::SIZE_46_4 => '4절 (394×545)',
        self::SIZE_46_8 => '8절 (394×272)',
        self::SIZE_46_16 => '16절 (197×272)',

        self::SMALL_NATIONAL_FULL => '소국전 (625×880)',
        self::SMALL_NATIONAL_2 => '소국전2절 (625×440)',
        self::SMALL_NATIONAL_4 => '소국전4절 (440×317)',
        self::SMALL_NATIONAL_8 => '소국전8절 (220×317)',
    };
}
}