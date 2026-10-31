<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShoppingSettingItemResource extends JsonResource
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
            'shopping_setting_id' => $this->shopping_setting_id,
            'type' => $this->whenLoaded('setting', fn() => $this->setting?->type?->value),
            'title' => $this->title,
            'content' => $this->content,
            'is_default' => (bool) $this->is_default,
            'sort_order' => (int) $this->sort_order,
        ];
    }
}
