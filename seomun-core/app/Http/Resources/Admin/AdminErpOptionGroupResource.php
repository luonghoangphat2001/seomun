<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminErpOptionGroupResource extends JsonResource
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
            'code' => $this->code,
            'label' => $this->label,
            'type' => $this->type,
            'display_type' => $this->display_type,
            'is_required' => (bool) $this->is_required,
            'sort_order' => $this->sort_order,
            'options_count' => $this->whenCounted('erpOptions'),
            'created_at' => $this->created_at?->format('Y-m-d\TH:i:s.v\Z'),
            'updated_at' => $this->updated_at?->format('Y-m-d\TH:i:s.v\Z'),
        ];
    }
}