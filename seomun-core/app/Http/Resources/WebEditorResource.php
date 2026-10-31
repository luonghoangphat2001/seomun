<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WebEditorResource extends JsonResource
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
            'name' => $this->name,
            'type' => $this->type,
            'width' => $this->width,
            'height' => $this->height,
            'unit' => $this->unit,
            'dpi' => $this->dpi,
            'bleed' => $this->bleed,
            'safe_area' => $this->safe_area,
            'config_json' => $this->config_json,
            'is_active' => $this->is_active,
        ];
    }
}
