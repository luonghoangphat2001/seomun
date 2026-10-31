<?php

namespace App\Http\Resources\Webhook;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class WebhookPartnerOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'order_external_number' => $this->order_external_number,
            'display_order_number' => $this->when(
                $this->order_group_id && $this->order_sequence,
                fn () => $this->display_order_number
            ),
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'product_name' => $this->product_name,
            'total_amount' => $this->total_amount,
            'design_file_url' => $this->design_file_url,
            'design_file_local' => $this->design_file_local
                ? Storage::disk('public')->url($this->design_file_local)
                : null,
            'item_count' => $this->whenLoaded('items', fn () => $this->items->count()),
            'items' => WebhookPartnerOrderItemResource::collection($this->whenLoaded('items')),
            'placed_at' => $this->placed_at,
            'created_at' => $this->created_at,
        ];
    }
}
