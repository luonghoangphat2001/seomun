<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUnitPriceItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'unit_price_id' => $this->unit_price_id,
            'price_value' => (string) $this->price_value,
            'raw_cost' => $this->raw_cost ? (string) $this->raw_cost : null,
            'attributes' => $this->attributes,
            'quantity_min' => $this->quantity_min,
            'status' => [
                'value' => $this->is_active ? 'active' : 'inactive',
                'label' => $this->is_active ? 'Active' : 'Inactive',
            ],
            'is_active' => $this->is_active,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'unit_price' => $this->whenLoaded('unitPrice', function () {
                return [
                    'id' => $this->unitPrice->id,
                    'unit_price_name' => $this->unitPrice->unit_price_name,
                    'category' => $this->unitPrice->category,
                ];
            }),
        ];
    }
}
