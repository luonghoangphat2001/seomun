<?php

namespace App\Enums;

enum DeliveryStatus: string
{
    case Pickup = 'pickup';
    case InTransit = 'in_transit';
    case Delivered = 'delivered';

    public function label(): string
    {
        return match ($this) {
            self::Pickup => 'Pickup',
            self::InTransit => 'In transit',
            self::Delivered => 'Delivered',
        };
    }

    /**
     * @return array<int, array<string, string>>
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
