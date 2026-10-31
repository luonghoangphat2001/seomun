<?php

namespace App\Enums;

enum CategoryEnum: string
{
    case BOOK = 'BOOK';
    case WIRELESS_BOOKLET = 'WIRELESS_BOOKLET';
    case SADDLE_STITCHED_BOOKLET = 'SADDLE_STITCHED_BOOKLET';
    case TWIN_RING_BOOKLET = 'TWIN_RING_BOOKLET';
    case COILING_BOOKLET = 'COILING_BOOKLET';

    case HOT_DEAL_BOOKLET = 'HOT_DEAL_BOOKLET';
    case HOT_DEAL_WIRELESS_BOOKLET = 'HOT_DEAL_WIRELESS_BOOKLET';
    case HOT_DEAL_SADDLE_STITCHED_BOOKLET = 'HOT_DEAL_SADDLE_STITCHED_BOOKLET';
    case HOT_DEAL_TWIN_RING_BOOKLET = 'HOT_DEAL_TWIN_RING_BOOKLET';
    case HOT_DEAL_COILING_BOOKLET = 'HOT_DEAL_COILING_BOOKLET';

    case BUSINESS_CARD = 'BUSINESS_CARD';
    case POSTCARD = 'POSTCARD';
    case TICKET = 'TICKET';
    case LEAFLET = 'LEAFLET';
    case FLYER = 'FLYER';
    case POSTER = 'POSTER';
    case TABLE_CALENDAR = 'TABLE_CALENDAR';
    case STICKER = 'STICKER';
    case HANGING_BANNER = 'HANGING_BANNER';
    case BANNER = 'BANNER';
    case LARGE_FORMAT_PRINTING = 'LARGE_FORMAT_PRINTING';
    case POP_CARDBOARD = 'POP_CARDBOARD';
    case DESK_CALENDAR = 'DESK_CALENDAR';
    case ROLL_UP_BANNER = 'roll_up_banner';
    case BIG_POLE_BANNER = 'big_pole_banner';
    case GENERAL_BANNER = 'general_banner';

    public function label(): string
    {
        return match ($this) {
            self::BOOK => 'Book',
            self::WIRELESS_BOOKLET => 'Wireless Booklet',
            self::SADDLE_STITCHED_BOOKLET => 'Saddle-Stitched Booklet',
            self::TWIN_RING_BOOKLET => 'Twin Ring Booklet',
            self::COILING_BOOKLET => 'Coiling Booklet',

            self::HOT_DEAL_BOOKLET => 'Hot Deal Booklet',
            self::HOT_DEAL_WIRELESS_BOOKLET => 'Hot Deal Wireless Booklet',
            self::HOT_DEAL_SADDLE_STITCHED_BOOKLET => 'Hot Deal Saddle-Stitched Booklet',
            self::HOT_DEAL_TWIN_RING_BOOKLET => 'Hot Deal Twin Ring Booklet',
            self::HOT_DEAL_COILING_BOOKLET => 'Hot Deal Coiling Booklet',

            self::BUSINESS_CARD => 'Business Card',
            self::POSTCARD => 'Postcard',
            self::TICKET => 'Ticket',
            self::LEAFLET => 'Leaflet',
            self::FLYER => 'Flyer',
            self::POSTER => 'Poster',
            self::TABLE_CALENDAR => 'Table Calendar',
            self::STICKER => 'Sticker',
            self::HANGING_BANNER => 'Hanging Banner',
            self::BANNER => 'Banner',
            self::LARGE_FORMAT_PRINTING => 'Large Format Printing',
            self::POP_CARDBOARD => 'POP/Cardboard',
            self::DESK_CALENDAR => 'Desk Calendar',
            self::ROLL_UP_BANNER => 'Roll Up Banner',
            self::BIG_POLE_BANNER => 'Big Pole Banner',
            self::GENERAL_BANNER => 'General Banner',
        };
    }

    public function labelKo(): string
    {
        return match ($this) {
            self::BOOK => '책자',
            self::WIRELESS_BOOKLET => '무선제본',
            self::SADDLE_STITCHED_BOOKLET => '중철제본',
            self::TWIN_RING_BOOKLET => '트윈링제본',
            self::COILING_BOOKLET => '코일링제본',

            self::HOT_DEAL_BOOKLET => '핫딜책자',
            self::HOT_DEAL_WIRELESS_BOOKLET => '핫딜 무선제본',
            self::HOT_DEAL_SADDLE_STITCHED_BOOKLET => '핫딜 중철제본',
            self::HOT_DEAL_TWIN_RING_BOOKLET => '핫딜 트윈링제본',
            self::HOT_DEAL_COILING_BOOKLET => '핫딜 코일링제본',

            self::BUSINESS_CARD => '명함',
            self::POSTCARD => '엽서',
            self::TICKET => '티켓',
            self::LEAFLET => '리플렛',
            self::FLYER => '전단지',
            self::POSTER => '포스터',
            self::TABLE_CALENDAR => '탁상달력',
            self::STICKER => '스티커',
            self::HANGING_BANNER => '현수막',
            self::BANNER => '배너',
            self::LARGE_FORMAT_PRINTING => '대형출력',
            self::POP_CARDBOARD => 'POP/골판지',
            self::DESK_CALENDAR => '탁상달력',
            self::ROLL_UP_BANNER => '롤업배너',
            self::BIG_POLE_BANNER => '대형폴배너',
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
        if ($label === null || trim($label) === '') {
            return null;
        }

        $normalizedLabel = self::normalize($label);

        $exactMatches = [];
        $partialMatches = [];

        foreach (self::cases() as $case) {
            $normalizedCaseLabel = self::normalize($case->labelKo());

            if ($normalizedCaseLabel === '') {
                continue;
            }

            // 1. Exact match
            if ($normalizedCaseLabel === $normalizedLabel) {
                $exactMatches[] = $case;

                continue;
            }

            // 2. Partial match
            if (
                str_contains($normalizedLabel, $normalizedCaseLabel) ||
                str_contains($normalizedCaseLabel, $normalizedLabel)
            ) {
                $partialMatches[] = [
                    'case' => $case,
                    'score' => min(
                        strlen($normalizedLabel),
                        strlen($normalizedCaseLabel)
                    ),
                ];
            }
        }

        // Exact match
        if ($exactMatches !== []) {
            return self::sortByPriority($exactMatches)[0];
        }

        // Partial match
        if ($partialMatches !== []) {
            usort(
                $partialMatches,
                fn ($a, $b) => $b['score'] <=> $a['score']
            );

            return $partialMatches[0]['case'];
        }

        return null;
    }

    private static function sortByPriority(array $cases): array
    {
        $priority = [
            self::DESK_CALENDAR->value => 100,
            self::TABLE_CALENDAR->value => 90,
        ];

        usort(
            $cases,
            fn ($a, $b) => ($priority[$b->value] ?? 0)
                <=>
                ($priority[$a->value] ?? 0)
        );

        return $cases;
    }

    private static function normalize(string $value): string
    {
        $value = mb_strtolower(trim($value), 'UTF-8');

        $value = preg_replace('/\s+/u', '', $value);

        $value = preg_replace('/s$/i', '', $value);

        return $value;
    }
}
