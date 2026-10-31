<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderCodeOptionMappingResource extends JsonResource
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
            'order_code' => $this->order_code,
            'name' => $this->name,
            'erp_option_group_ids' => $this->erp_option_group_ids,
            'erp_option_groups' => $this->whenLoaded('erpOptionGroups', function () {
                return $this->erpOptionGroups->map(function ($group) {
                    return [
                        'id' => $group->id,
                        'code' => $group->code,
                        'label' => $group->label,
                        'display_type' => $group->display_type,
                        'is_required' => $group->is_required,
                        'options' => $group->erpOptions->map(function ($option) {
                            return [
                                'id' => $option->id,
                                'code' => $option->code,
                                'label' => $option->label,
                                'value' => $option->value,
                                'additional_price' => $option->additional_price,
                                'osrc_um' => $option->osrc_um,
                                'preview_image' => $option->preview_image,
                            ];
                        }),
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
