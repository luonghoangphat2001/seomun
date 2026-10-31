<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminCouponResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $statusLabel = 'active';
        if (! $this->is_active) {
            $statusLabel = 'inactive';
        } elseif ($this->starts_at && $this->starts_at->isFuture()) {
            $statusLabel = 'upcoming';
        } elseif ($this->expires_at && $this->expires_at->isPast()) {
            $statusLabel = 'expired';
        } elseif ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            $statusLabel = 'exhausted';
        }

        $data = [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'discount_type' => $this->discount_type,
            'discount_value' => (float) $this->discount_value,
            'min_order_amount' => (float) $this->min_order_amount,
            'max_discount_amount' => $this->max_discount_amount !== null ? (float) $this->max_discount_amount : null,
            'usage_limit' => $this->usage_limit,
            'usage_count' => (int) $this->usage_count,
            'issued_count' => $this->user_coupons_count ?? ($this->relationLoaded('userCoupons') ? $this->userCoupons->count() : 0),
            'claim_starts_at' => $this->claim_starts_at ? $this->claim_starts_at->format('Y-m-d H:i:s') : null,
            'claim_ends_at' => $this->claim_ends_at ? $this->claim_ends_at->format('Y-m-d H:i:s') : null,
            'is_claimable' => $this->isClaimable(),
            'starts_at' => $this->starts_at ? $this->starts_at->format('Y-m-d H:i:s') : null,
            'expires_at' => $this->expires_at ? $this->expires_at->format('Y-m-d H:i:s') : null,
            'is_active' => (bool) $this->is_active,
            'is_valid' => $this->isValid(),
            'status_label' => $statusLabel,
            'sort_order' => (int) $this->sort_order,
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
        ];

        if ($this->used_user_coupons_count !== null) {
            $issuedTotal = (int) $this->user_coupons_count;
            $usedTotal = (int) $this->used_user_coupons_count;

            $data['statistics'] = [
                'issued_total' => $issuedTotal,
                'used_total' => $usedTotal,
                'available_total' => (int) $this->available_user_coupons_count,
                'upcoming_total' => (int) $this->upcoming_user_coupons_count,
                'expired_total' => (int) $this->expired_user_coupons_count,
                'usage_rate' => $issuedTotal > 0 ? round(($usedTotal / $issuedTotal) * 100, 2) : 0,
            ];
        }

        return $data;
    }
}
