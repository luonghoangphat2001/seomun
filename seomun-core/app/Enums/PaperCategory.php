<?php

namespace App\Enums;

enum PaperCategory: string
{
    case GENERAL = 'GENERAL_PAPER';
    case SPECIALTY = 'SPECIALTY_PAPER';
    case HIGH_QUALITY = 'HIGH_QUALITY_PAPER';
    case STICKER = 'STICKER_PAPER';
    case PAPERBOARD = 'PAPERBOARD';
    case BANNER = 'BANNER';
    case PLASTIC = 'PLASTIC';
    case COLORED = 'COLORED_PAPER';

    public function label(): string
    {
        return match ($this) {
            self::GENERAL => 'General paper',
            self::SPECIALTY => 'Specialty paper',
            self::HIGH_QUALITY => 'High-quality paper',
            self::STICKER => 'Sticker paper',
            self::PAPERBOARD => 'Paperboard',
            self::BANNER => 'Banner',
            self::PLASTIC => 'Plastic',
            self::COLORED => 'Colored paper',
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

    public static function fromValue(string $value): self
    {
        return self::from($value);
    }
}
