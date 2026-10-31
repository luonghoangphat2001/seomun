<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PointTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type?->value,
            'type_label' => $this->type?->label(),
            'amount' => $this->amount,
            'remaining_amount' => $this->remaining_amount,
            'category' => $this->category?->value,
            'category_label' => $this->category?->label(),
            'order_id' => $this->order_id,
            'order_number' => $this->whenLoaded('order', fn() => $this->order?->order_number),
            'product_name' => $this->whenLoaded('order', fn() => $this->order?->product_name),
            'membership_tier' => $this->user?->MembershipTier ? [
                'name' => $this->user->MembershipTier->name,
                'accumulation_rate' => $this->user->MembershipTier->accumulation_rate,
            ] : null,
            'reference_id' => $this->reference_id,
            'parent_id' => $this->parent_id,
            'expired_at' => $this->expired_at?->toDateTimeString(),
            'description' => $this->description,
            'created_by' => $this->created_by,
            'creator_name' => $this->whenLoaded('creator', fn() => $this->creator?->name ?? $this->creator?->username),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
