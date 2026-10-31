<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $metadata = $this->metadata ?? [];

        return [
            'id' => $this->id,
            'option_group_id' => $this->option_group_id,
            'option_code' => $this->option_code,
            'field_name' => $this->field_name,
            'category' => $this->category,
            'label' => $this->label,
            'value' => $this->value,
            'additional_price' => $this->additional_price,
            'metadata' => $metadata,
            'info_icon' => [
                'enabled' => (bool) ($metadata['info_icon_enabled'] ?? false),
                'description' => $metadata['info_description'] ?? null,
            ],
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
