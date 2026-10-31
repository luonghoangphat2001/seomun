<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderModificationLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $properties = $this->properties ?? [];
        $old = $properties['old'] ?? [];
        $new = $properties['attributes'] ?? [];

        return [
            'id' => $this->id,
            'modified_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'modified_by' => $this->whenLoaded('causer', function () {
                return $this->causer ? [
                    'id' => $this->causer->id,
                    'username' => $this->causer->username ?? null,
                    'name' => $this->causer->name ?? null,
                    'email' => $this->causer->email ?? null,
                ] : null;
            }),
            'fields' => [
                'before' => $old,
                'after' => $new,
            ],
            'reason' => $properties['reason'] ?? null,
        ];
    }
}
