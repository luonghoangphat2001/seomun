<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminPointSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'signup_reward' => $this->signup_reward,
            'monthly_reward_limit' => $this->monthly_reward_limit,
            'invite_reward_inviter' => $this->invite_reward_inviter,
            'invite_reward_invited' => $this->invite_reward_invited,
            'min_order_amount_to_use' => $this->min_order_amount_to_use,
            'max_point_usage_percent' => $this->max_point_usage_percent,
            'max_point_usage_amount' => $this->max_point_usage_amount,
            'enable_payment_restriction' => $this->enable_payment_restriction,
            'enable_point_restriction' => $this->enable_point_restriction,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
