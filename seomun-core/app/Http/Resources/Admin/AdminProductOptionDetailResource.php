<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductOptionDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'option_group_id' => $this->option_group_id,
            'group' => $this->whenLoaded('group', function () {
                return $this->group ? [
                    'id' => $this->group->id,
                    'name' => $this->group->name,
                    'code' => $this->group->code,
                    'product' => $this->group->product ? [
                        'id' => $this->group->product->id,
                        'name' => $this->group->product->name,
                    ] : null,
                ] : null;
            }),
            'option_code' => $this->option_code,
            'field_name' => $this->field_name,
            'category' => $this->category,
            'erp_option_id' => $this->erp_option_id,
            'label' => $this->label,
            'value' => $this->value,
            'additional_price' => $this->additional_price,
            'metadata' => $this->metadata,
            'info_icon' => [
                'enabled' => (bool) (($this->metadata ?? [])['info_icon_enabled'] ?? false),
                'description' => ($this->metadata ?? [])['info_description'] ?? null,
            ],
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
