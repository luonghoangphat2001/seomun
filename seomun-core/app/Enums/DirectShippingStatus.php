<?php

namespace App\Enums;

enum DirectShippingStatus: string
{
    case Pending = 'pending';
    case Cancelled = 'cancelled';
    case Confirmed = 'confirmed';

    /**
     * Korean label
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => '대기',
            self::Cancelled => '취소',
            self::Confirmed => '확정',
        };
    }

    /**
     * Options for select box
     */
    public static function options(): array
    {
        return array_map(
            fn (self $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ],
            self::cases()
        );
    }
}