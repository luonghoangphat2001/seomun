<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminPaperPriceResource extends JsonResource
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
            'paper_id' => $this->paper_id,
            'paper_size_division_code' => $this->paper_size_division_code,
            'supply_price' => $this->supply_price,
            'cost' => $this->cost,
            'is_hot_deal' => $this->is_hot_deal,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
