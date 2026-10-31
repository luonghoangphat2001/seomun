<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductOptionGroupDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'erp_option_group_id' => $this->erp_option_group_id,
            'product' => $this->whenLoaded('product', function () {
                return $this->product ? [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                ] : null;
            }),
            'product_option_group_tab' => $this->product_option_group_tab,
            'code' => $this->code,
            'name' => $this->name,
            'display_type' => $this->display_type,
            'is_required' => $this->is_required,
            'info_icon_enabled' => (bool) $this->info_icon_enabled,
            'info_content' => $this->info_content,
            'sort_order' => $this->sort_order,
            'options' => $this->whenLoaded('options', function () {
                return AdminProductOptionDetailResource::collection($this->options);
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
