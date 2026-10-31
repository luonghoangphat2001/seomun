<?php

namespace App\Http\Resources\Admin;

use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminCouponIssuanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $orderStatus = $this->order?->status;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'coupon_id' => $this->coupon_id,
            'status' => $this->status instanceof BackedEnum ? $this->status->value : $this->status,
            'received_at' => $this->received_at?->toISOString(),
            'used_at' => $this->used_at?->toISOString(),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'username' => $this->user?->username,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
                'mobile' => $this->user?->mobile,
                'customer' => $this->user?->relationLoaded('customer') && $this->user->customer ? [
                    'id' => $this->user->customer->id,
                    'company_name' => $this->user->customer->company_name,
                ] : null,
            ]),
            'order' => $this->whenLoaded('order', fn () => $this->order ? [
                'id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'status' => $orderStatus instanceof BackedEnum ? $orderStatus->value : $orderStatus,
                'total_amount' => (int) $this->order->total_amount,
                'discount_amount' => (int) $this->order->discount_amount,
            ] : null),
        ];
    }
}
