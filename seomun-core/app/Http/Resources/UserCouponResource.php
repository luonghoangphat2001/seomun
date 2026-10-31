<?php

namespace App\Http\Resources;

use App\Enums\UserCouponStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserCouponResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'coupon_id' => $this->coupon_id,
            'received_at' => $this->received_at,
            'used_at' => $this->used_at,
            'order_id' => $this->order_id,
            'status' => $this->getActualStatus(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Include coupon details if loaded
        if ($this->relationLoaded('coupon') && $this->coupon) {
            $data['coupon'] = [
                'id' => $this->coupon->id,
                'code' => $this->coupon->code,
                'name' => $this->coupon->name,
                'description' => $this->coupon->description,
                'discount_type' => $this->coupon->discount_type,
                'discount_value' => (float) $this->coupon->discount_value,
                'min_order_amount' => (float) $this->coupon->min_order_amount,
                'max_discount_amount' => $this->coupon->max_discount_amount ? (float) $this->coupon->max_discount_amount : null,
                'claim_starts_at' => $this->coupon->claim_starts_at,
                'claim_ends_at' => $this->coupon->claim_ends_at,
                'starts_at' => $this->coupon->starts_at,
                'expires_at' => $this->coupon->expires_at,
                'is_valid' => $this->coupon->isValid(),
                'is_upcoming' => (bool) ($this->coupon->starts_at && $this->coupon->starts_at->isFuture()),
            ];
        }

        // Include order details if loaded
        if ($this->relationLoaded('order') && $this->order) {
            $data['order'] = [
                'id' => $this->order->id,
                'order_number' => $this->order->order_number,
            ];
        }

        return $data;
    }
}
