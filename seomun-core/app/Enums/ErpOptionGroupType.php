<?php

namespace App\Enums;

enum ErpOptionGroupType: string
{
    case DEFAULT = 'DEFAULT';
    case STANDARD = 'STANDARD';
    case PRINTED_COLOR = 'PRINTED_COLOR';
    case PAPER = 'PAPER';
    case POST_PROCESSING = 'POST_PROCESSING';

    public function label(): string
    {
        return match ($this) {
            self::STANDARD => 'Standard',
            self::PRINTED_COLOR => 'Printed color',
            self::PAPER => 'Paper',
            self::POST_PROCESSING => 'Post-processing',
        };
    }

    public static function labels(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn ($case) => [
                $case->value => $case->label(),
            ])
            ->toArray();
    }

    public static function fromValue(string $value): self
    {
        return self::from($value);
    }
}
