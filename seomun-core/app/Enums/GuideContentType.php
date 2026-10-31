<?php

namespace App\Enums;

enum GuideContentType: string
{
    case COATED = 'coated';
    case OSHI = 'oshi';
    case ROUNDING = 'rounding';
    case PERFORATION = 'perforation';
    case GROUNDING = 'grounding';
    case NUMBERING = 'numbering';
    case DOMUSONG = 'domusong';
    case FOUNDATION = 'foundation';

    public function label(): string
    {
        return match ($this) {
            self::COATED => 'Coated',
            self::OSHI => 'Oshi',
            self::ROUNDING => 'Rounding',
            self::PERFORATION => 'Perforation',
            self::GROUNDING => 'Grounding',
            self::NUMBERING => 'Numbering',
            self::DOMUSONG => 'Domusong',
            self::FOUNDATION => 'Foundation',
        };
    }

    public function labelKo(): string
    {
        return match ($this) {
            self::COATED => '코팅',
            self::OSHI => '오시',
            self::ROUNDING => '귀도리',
            self::PERFORATION => '미싱',
            self::GROUNDING => '도무송',
            self::NUMBERING => '넘버링',
            self::DOMUSONG => '도무송',
            self::FOUNDATION => '접지',
        };
    }
}