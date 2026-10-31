<?php

namespace App\Enums;

enum ErpOptionGroupCode: string
{
    case SIZE = 'size';
    case PAPER = 'paper';

    case PAPER_TYPE = 'paper_type';
    case PAPER_COLOR = 'paper_color';
    case PAPER_WEIGHT = 'paper_weight';
    case PRINTED_SIDE = 'printed_side';

    case PRINTED_COLOR_FSIDE = 'printed_color_fside';
    case PRINTED_COLOR_BSIDE = 'printed_color_bside';

    //outsource
    case SUBJECT_MATTER = 'subject_matter';

    // Book
    case COVER_PAPER = "cover_paper";
    case INNER_PAPER = "inner_paper";
    case ADDITIONAL_PAPER = "additional_paper";
    case COLORED_PAPER_1 = "colored_paper_1";
    case COLORED_PAPER_2 = "colored_paper_2";
    case FLYLEAF_PAPER = "flyleaf_paper";

    case PRINTED_COVER_SIDE = 'printed_cover_side';
    case PRINTED_INNER_SIDE = 'printed_inner_side';

    case PRINTED_COLOR_COVER_FSIDE = 'printed_color_cover_fside';
    case PRINTED_COLOR_COVER_BSIDE = 'printed_color_cover_bside';
    case PRINTED_COLOR_INNER_FSIDE = 'printed_color_inner_fside';
    case PRINTED_COLOR_INNER_BSIDE = 'printed_color_inner_bside';
    
    //post processing
    case COATED = 'coated';
    case OSHI = 'oshi';
    case ROUNDING = 'rounding';
    case PERFORATION = 'perforation';
    case GROUNDING = 'grounding';
    case NUMBERING = 'numbering';
    case DOMUSONG = 'domusong';
    case FOUNDATION = 'foundation';

    public function type(): ErpOptionGroupType
    {
        return match ($this) {
            self::SIZE => ErpOptionGroupType::STANDARD,

            self::PAPER => ErpOptionGroupType::PAPER,
            self::PAPER_TYPE => ErpOptionGroupType::PAPER,
            self::PAPER_COLOR => ErpOptionGroupType::PAPER,
            self::PAPER_WEIGHT => ErpOptionGroupType::PAPER,

            self::PRINTED_SIDE => ErpOptionGroupType::PRINTED_COLOR,
            self::PRINTED_COLOR_FSIDE => ErpOptionGroupType::PRINTED_COLOR,
            self::PRINTED_COLOR_BSIDE => ErpOptionGroupType::PRINTED_COLOR,

            self::FOUNDATION => ErpOptionGroupType::POST_PROCESSING,
            self::COATED => ErpOptionGroupType::POST_PROCESSING,
            self::PERFORATION => ErpOptionGroupType::POST_PROCESSING,
            self::ROUNDING => ErpOptionGroupType::POST_PROCESSING,
            self::OSHI => ErpOptionGroupType::POST_PROCESSING,
            self::GROUNDING => ErpOptionGroupType::POST_PROCESSING,
            self::NUMBERING => ErpOptionGroupType::POST_PROCESSING,
            self::DOMUSONG => ErpOptionGroupType::POST_PROCESSING,

            default => ErpOptionGroupType::DEFAULT,
        };
    }

    public function label(): string
    {
        return $this->koreanLabel() ?? str($this->value)->replace('_', ' ')->title();
    }

    public function koreanLabel(): ?string
    {
        return match ($this) {
            self::COVER_PAPER => '표지 용지',
            self::PRINTED_COVER_SIDE => '표지 인쇄 면',
            self::PRINTED_COLOR_COVER_FSIDE => '표지 앞면 인쇄 색상',
            self::PRINTED_COLOR_COVER_BSIDE => '표지 뒷면 인쇄 색상',
            self::INNER_PAPER => '내지 용지',
            self::PRINTED_INNER_SIDE => '내지 인쇄 면',
            self::PRINTED_COLOR_INNER_FSIDE => '내지 앞면 인쇄 색상',
            self::PRINTED_COLOR_INNER_BSIDE => '내지 뒷면 인쇄 색상',
            default => null,
        };
    }

    public static function getByType(ErpOptionGroupType $type): array
    {
        return collect(self::cases())
            ->filter(fn($case) => $case->type() === $type)
            ->values()
            ->toArray();
    }
}
