<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminErpOptionResource extends JsonResource
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
            'value' => $this->value,
            'additional_price' => $this->additional_price,
            'osrc_um' => $this->osrc_um,
            'sort_order' => $this->sort_order,
            'is_active' => (bool) $this->is_active,
            'status' => $this->is_active ? 'active' : 'inactive',
            'status_label' => $this->is_active ? 'Active' : 'Inactive',
            'attributes' => $this->attributes,
            'erp_option_group' => $this->whenLoaded('erpOptionGroup', function () {
                return [
                    'id' => $this->erpOptionGroup->id,
                    'code' => $this->erpOptionGroup->code,
                    'label' => $this->erpOptionGroup->label,
                    'display_type' => $this->erpOptionGroup->display_type,
                    'is_required' => (bool) $this->erpOptionGroup->is_required,
                    'sort_order' => $this->erpOptionGroup->sort_order,
                ];
            }, null),
            'conditions_count' => $this->whenCounted('conditions'),
            'trigger_dependencies_count' => $this->whenCounted('triggerDependencies'),
            // UTC ISO-8601 with milliseconds, e.g. 2026-01-30T01:34:39.334Z
            'created_at' => $this->created_at?->format('Y-m-d\TH:i:s.v\Z'),
            'updated_at' => $this->updated_at?->format('Y-m-d\TH:i:s.v\Z'),
        ];
    }
}
