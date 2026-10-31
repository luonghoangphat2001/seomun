<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminMembershipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'condition_amount' => $this->threshold_amount,
            'accrual_rate' => $this->accumulation_rate,
            'free_shipping' => $this->has_free_shipping,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'members_count' => $this->members_count ?? 0,
            'average_quarterly_spend' => $this->average_quarterly_spend ?? 0,
        ];
    }
}
