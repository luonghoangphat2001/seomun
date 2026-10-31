<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LimitManagementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'limit' => $this->limit,
            'usage_amount' => $this->usage_amount,
            'remaining_amount' => $this->remaining_amount,
            'status' => $this->status,
        ];
    }
}
