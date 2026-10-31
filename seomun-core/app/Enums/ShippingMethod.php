<?php

namespace App\Enums;

enum ShippingMethod: string
{
    case COURIER = 'courier';      // Standard delivery (택배)
    case QUICK = 'quick';          // Quick delivery (퀵)
    case PICKUP = 'pickup';        // Pickup (방문수령)
    case DIRECT = 'direct';        // Direct / merchant delivery (직배송)

    public const EXT_CODE_COURIER = '502';

    public const EXT_CODE_QUICK = '504';

    public const EXT_CODE_PICKUP = '507';

    /**
     * Get Korean label for shipping method
     */
    public function label(): string
    {
        return match ($this) {
            self::COURIER => '택배',
            self::QUICK => '퀵',
            self::PICKUP => '방문수령',
            self::DIRECT => '직배송',
        };
    }

    /**
     * Check if shipping requires address
     */
    public function requiresAddress(): bool
    {
        return in_array($this, [self::COURIER, self::QUICK, self::DIRECT]);
    }

    /**
     * Convert external code to internal shipping method
     */
    public static function fromExternal(string $code): ?string
    {
        return match ($code) {
            self::EXT_CODE_COURIER => self::COURIER->value,
            self::EXT_CODE_QUICK => self::QUICK->value,
            self::EXT_CODE_PICKUP => self::PICKUP->value,
            default => null,
        };
    }
}
