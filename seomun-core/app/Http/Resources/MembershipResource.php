<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'threshold_amount' => $this->threshold_amount,
            'accumulation_rate' => $this->accumulation_rate,
            'has_free_shipping' => $this->has_free_shipping,
            'sort_order' => $this->sort_order ?? null,
            'is_active' => $this->is_active ?? null,
        ];
    }
}
