<?php

namespace App\Enums;

enum ErpOptionDependencyType: string
{
    case FILTER_OPTIONS = 'filter_options';
    case HIDE_GROUP = 'hide_group';

    public function label(): string
    {
        return match ($this) {
            self::FILTER_OPTIONS => '필터 옵션',
            self::HIDE_GROUP => '그룹 숨기기',
        };
    }

    public static function labels(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn($case) => [
                $case->value => $case->label()
            ])
            ->toArray();
    }
}