<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'discount_type' => $this->discount_type,
            'discount_value' => (float) $this->discount_value,
            'min_order_amount' => (float) $this->min_order_amount,
            'max_discount_amount' => $this->max_discount_amount ? (float) $this->max_discount_amount : null,
            'usage_limit' => $this->usage_limit,
            'usage_count' => $this->usage_count,
            'claim_starts_at' => $this->claim_starts_at,
            'claim_ends_at' => $this->claim_ends_at,
            'is_claimable' => $this->isClaimable(),
            'starts_at' => $this->starts_at,
            'expires_at' => $this->expires_at,
            'is_active' => (bool) $this->is_active,
            'is_valid' => $this->isValid(),
            'is_upcoming' => $this->isUpcoming(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
