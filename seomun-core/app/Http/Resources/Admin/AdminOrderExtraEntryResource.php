<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderExtraEntryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Enum values
            'status' => $this->status?->value ?? $this->status,
            'input_type' => $this->input_type?->value ?? $this->input_type,

            'is_required' => (bool) $this->is_required,
            'label' => $this->label,

            'input_options' => $this->input_options,

            // Relations
            'products' => $this->whenLoaded('products', function () {
                return ProductResource::collection($this->products);
            }),

            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->when($this->deleted_at, $this->deleted_at),
        ];
    }
}
