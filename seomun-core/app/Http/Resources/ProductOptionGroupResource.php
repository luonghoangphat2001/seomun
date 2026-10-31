<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductOptionGroupResource extends JsonResource
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
            'name' => $this->name,
            'display_type' => $this->display_type,
            'is_required' => $this->is_required,
            'info_icon_enabled' => (bool) $this->info_icon_enabled,
            'info_content' => $this->info_content,
            'sort_order' => $this->sort_order,
            'erp_option_group_id' => $this->erp_option_group_id,
            'options' => ProductOptionResource::collection(
                $this->whenLoaded('options', fn () => $this->options->each->setRelation('group', $this))
            ),
        ];
    }
}
