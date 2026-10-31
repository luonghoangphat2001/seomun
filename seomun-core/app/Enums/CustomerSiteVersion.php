<?php

namespace App\Enums;

enum CustomerSiteVersion: string
{
    case LEGACY = 'legacy';                 // 기존버전
    case V3 = 'v3';                         // 신규버전(v3)
    case LEGACY_AND_V3 = 'legacy_and_v3';   // 기존/신규버전(v3)

    public function label(): string
    {
        return match ($this) {
            self::LEGACY => '기존버전',
            self::V3 => '신규버전(v3)',
            self::LEGACY_AND_V3 => '기존/신규버전(v3)',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::LEGACY => 'Legacy Version',
            self::V3 => 'New Version (v3)',
            self::LEGACY_AND_V3 => 'Legacy / New Version (v3)',
        };
    }
}
