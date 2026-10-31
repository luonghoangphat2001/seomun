<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserLimitResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'customer' => new AdminUserResource($this->whenLoaded('user')),
            'id' => $this->id,
            'limit' => $this->limit,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'history' => AdminLimitUsagedLogsResource::collection($this->whenLoaded('history')),
        ];
    }
}
