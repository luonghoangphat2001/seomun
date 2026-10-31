<?php

namespace App\Helpers;

use Carbon\CarbonInterface;

class DateHelper
{

    public static function formatDateTime(
        ?CarbonInterface $date,
        string $timezone = "Asia/Ho_Chi_Minh",
        string $format = 'Y-m-d H:i:s'
    ): ?string {
        return $date?->copy()->timezone($timezone)->format($format);
    }

    public static function toVietnam(?CarbonInterface $date): ?CarbonInterface
    {
        return $date?->copy()->timezone("Asia/Ho_Chi_Minh");
    }

    public static function toKorea(?CarbonInterface $date): ?CarbonInterface
    {
        return $date?->copy()->timezone("Asia/Seoul");
    }
}