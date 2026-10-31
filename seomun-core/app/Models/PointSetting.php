<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointSetting extends Model
{
    protected $fillable = [
        'signup_reward',
        'monthly_reward_limit',
        'invite_reward_inviter',
        'invite_reward_invited',
        'min_order_amount_to_use',
        'max_point_usage_percent',
        'max_point_usage_amount',
        'enable_payment_restriction',
        'enable_point_restriction',
    ];

    protected $casts = [
        'signup_reward' => 'integer',
        'monthly_reward_limit' => 'integer',
        'invite_reward_inviter' => 'integer',
        'invite_reward_invited' => 'integer',
        'min_order_amount_to_use' => 'integer',
        'max_point_usage_percent' => 'integer',
        'max_point_usage_amount' => 'integer',
        'enable_payment_restriction' => 'boolean',
        'enable_point_restriction' => 'boolean',
    ];

    public static function getOrCreate(): self
    {
        $settings = self::first();

        if (! $settings) {
            $settings = self::create([]);
        }

        return $settings;
    }
}
