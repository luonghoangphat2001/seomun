<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminMemberActivityLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'recent_logins' => $this->resource['recent_logins'] ?? [],
            'recent_orders' => $this->resource['recent_orders'] ?? [],
            'information_modifications' => $this->resource['information_modifications'] ?? [],
        ];
    }
}
