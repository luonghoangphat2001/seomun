<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
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
            'total_quantity' => $this->total_quantity,
            'total_price' => (float) $this->total_price,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Include items if loaded
        if ($this->relationLoaded('items')) {
            $data['items'] = CartItemResource::collection($this->items);
        }

        return $data;
    }
}
