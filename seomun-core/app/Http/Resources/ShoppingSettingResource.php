<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShoppingSettingResource extends JsonResource
{
    /**
     * Transform the resource into an array for public view.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'type' => $this->type?->value ?? $this->type,
            'items' => ShoppingSettingItemResource::collection(
                $this->whenLoaded('activeItems', function () {
                    return $this->activeItems;
                }, $this->whenLoaded('items'))
            ),
            'default_item' => new ShoppingSettingItemResource($this->whenLoaded('defaultItem')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
