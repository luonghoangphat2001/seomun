<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminDesignerAssignedDesignOrderResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'order_status' => $this->status,
            'payment_status' => $this->payment_status,
            'product_name' => $this->product_name,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product?->id,
                'name' => $this->product?->name,
                'slug' => $this->product?->slug,
                'sku' => $this->product?->sku,
                'images' => $this->product?->images,
            ]),
            'customer' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'username' => $this->user?->username,
                'name' => $this->user?->name,
                'phone' => $this->user?->phone ?? $this->user?->mobile,
            ]),
            'assigned_design_item_count' => (int) ($this->assigned_design_item_count ?? 0),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
