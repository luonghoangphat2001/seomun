<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AdminUserGuideResource extends JsonResource
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
            'button_name' => $this->button_name,
            'attached_file' => $this->attached_file ? Storage::disk('public')->url($this->attached_file) : null,

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
