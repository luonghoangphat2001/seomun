<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminWebEditorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'type'        => $this->type,
            'width'       => (float) $this->width,
            'height'      => (float) $this->height,
            'unit'        => $this->unit,
            'dpi'         => $this->dpi ? (int) $this->dpi : null,
            'bleed'       => $this->bleed ? (float) $this->bleed : 0,
            'safe_area'   => $this->safe_area ? (float) $this->safe_area : 0,
            'config_json' => $this->config_json,
            'status'      => $this->status,
            'created_at'  => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at'  => $this->updated_at ? $this->updated_at->toIso8601String() : null,
        ];
    }
}
