<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'free_shipping_start_at',
        'free_shipping_end_at',
    ];

    protected $casts = [
        'free_shipping_start_at' => 'datetime',
        'free_shipping_end_at' => 'datetime',
    ];

    /**
     * Check if free shipping date range campaign is currently active.
     */
    public static function isFreeShippingActive(?Carbon $currentTime = null): bool
    {
        $setting = static::query()->first();
        if (! $setting) {
            return false;
        }

        if (! $setting->free_shipping_start_at || ! $setting->free_shipping_end_at) {
            return false;
        }

        $now = $currentTime ?? Carbon::now();

        return $now->between($setting->free_shipping_start_at, $setting->free_shipping_end_at);
    }
}
