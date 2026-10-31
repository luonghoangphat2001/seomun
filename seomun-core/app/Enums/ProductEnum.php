<?php

namespace App\Enums;

enum ProductEnum: string
{
    case SQUARE_STICKER = 'square_sticker';
    case DIE_CUT_STICKER = 'die_cut_sticker';
    case STICKY_NOTE = 'sticky_note';
    case TABLE_SETTING_PAPER = 'table_setting_paper';
    case L_HOLDER = 'l_holder';
    case MASTER_ENVELOPE = 'master_envelope';
    case COLOR_ENVELOPE = 'color_envelope';
    case GENERAL_BANNER = 'general_banner';

    public function label(): string
    {
        return match ($this) {
            self::SQUARE_STICKER => 'Square Sticker',
            self::DIE_CUT_STICKER => 'Die-cut Sticker',
            self::STICKY_NOTE => 'Sticky Note',
            self::TABLE_SETTING_PAPER => 'Table Setting Paper',
            self::L_HOLDER => 'L-Holder',
            self::MASTER_ENVELOPE => 'Master Envelope',
            self::COLOR_ENVELOPE => 'Color Envelope',
            self::GENERAL_BANNER => 'General Banner',
        };
    }

    public function labelKo(): string
    {
        return match ($this) {
            self::SQUARE_STICKER => '사각스티커',
            self::DIE_CUT_STICKER => '도무송스티커',
            self::STICKY_NOTE => '점착메모지',
            self::TABLE_SETTING_PAPER => '테이블세팅지',
            self::L_HOLDER => 'L홀더',
            self::MASTER_ENVELOPE => '마스타봉투',
            self::COLOR_ENVELOPE => '칼라봉투',
            self::GENERAL_BANNER => '일반현수막',
        };
    }

    public static function fromLabel(?string $label): ?self
    {
        if ($label == null) {
            return null;
        }
        foreach (self::cases() as $case) {
            if ($case->labelKo() === $label) {
                return $case;
            }
        }

        return null;
    }

    public static function fromProductLabel(?string $label): ?self
    {
        if ($label === null) {
            return null;
        }

        $normalizedLabel = self::normalize($label);

        foreach (self::cases() as $case) {
            if (self::normalize($case->labelKo()) === $normalizedLabel) {
                return $case;
            }
        }

        return null;
    }

    private static function normalize(string $value): string
    {
        $value = mb_strtolower(trim($value), 'UTF-8');

        // Bỏ khoảng trắng
        $value = preg_replace('/\s+/u', '', $value);

        // Bỏ 's' ở cuối nếu có
        $value = preg_replace('/s$/i', '', $value);

        return $value;
    }
}
