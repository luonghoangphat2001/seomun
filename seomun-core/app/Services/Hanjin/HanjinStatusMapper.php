<?php

namespace App\Services\Hanjin;

use App\Enums\DeliveryStatus;
use Carbon\Carbon;

class HanjinStatusMapper
{
    /**
     * Terminal status codes that should stop polling.
     *  65 = Delivery completed
     *  03 = Reservation cancelled
     *  92 = Marked ineligible for delivery
     */
    public const TERMINAL_STATUS_CODES = ['03', '65', '92'];

    public function map(?string $statusCode): DeliveryStatus
    {
        return match ($statusCode) {
            '65' => DeliveryStatus::Delivered,
            '63', '31', '32', '14', '11', '08', '07', '05', '01' => DeliveryStatus::InTransit,
            '03', '92' => DeliveryStatus::InTransit,
            default => DeliveryStatus::Pickup,
        };
    }

    public function isTerminal(?string $statusCode): bool
    {
        return $statusCode !== null && in_array($statusCode, self::TERMINAL_STATUS_CODES, true);
    }

    /**
     * @param  array<string, mixed>  $item
     */
    public function parseStatusDate(array $item): ?\DateTimeInterface
    {
        $raw = $item['statusDate'] ?? null;
        if (! is_string($raw) || $raw === '') {
            return null;
        }

        try {
            return Carbon::createFromFormat('Y-m-d H:i:s', $raw);
        } catch (\Throwable) {
            try {
                return Carbon::parse($raw);
            } catch (\Throwable) {
                return null;
            }
        }
    }
}
