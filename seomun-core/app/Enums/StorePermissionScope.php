<?php

namespace App\Enums;

enum StorePermissionScope: string
{
    case HEADQUARTERS = 'headquarters';           // 본부
    case BUSINESS_OFFICE = 'business_office';   // 사업소
    case TEAM = 'team';       // 팀
    case ONLY_YOU = 'only_you';     // 본인만

    public function label(): string
    {
        return match ($this) {
            self::HEADQUARTERS => '본부',
            self::BUSINESS_OFFICE => '사업소',
            self::TEAM => '팀',
            self::ONLY_YOU => '본인만',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::HEADQUARTERS => 'Headquarters',
            self::BUSINESS_OFFICE => 'Business Office',
            self::TEAM => 'Team',
            self::ONLY_YOU => 'Only You',
        };
    }
}
