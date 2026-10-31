<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderStatusHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $properties = $this->properties ?? [];

        return [
            'id' => $this->id,
            'changed_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'old_status' => $properties['old']['status'] ?? null,
            'new_status' => $properties['attributes']['status'] ?? null,
            // FSD: changed_by { id, name, email } (can include username as extra field)
            'changed_by' => $this->whenLoaded('causer', function () {
                return $this->causer ? [
                    'id' => $this->causer->id,
                    'name' => $this->causer->name ?? null,
                    'email' => $this->causer->email ?? null,
                    'username' => $this->causer->username ?? null,
                ] : null;
            }),
            'reason' => $properties['reason'] ?? null,
            'notes' => $properties['notes'] ?? null,
        ];
    }
}
