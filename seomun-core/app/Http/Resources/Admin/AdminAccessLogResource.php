<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminAccessLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $this->whenLoaded('user') ? $this->user : null;

        return [
            'id' => $this->id,
            'login_id' => $this->login_id,
            'username' => $user?->name ?? $user?->username ?? null, // UI shows "Username" column
            'ip_address' => $this->ip_address,
            'browser_info' => $this->browser_info,
            'description' => $this->explanation ?? $this->management ?? null, // UI shows "Description" column
            // Additional fields for detail view if needed
            'user_id' => $this->user_id,
            'user_agent' => $this->user_agent,
            'event_type' => $this->event_type,
            'connection_time' => $this->connection_time?->format('Y-m-d\TH:i:s.v\Z'),
            'access_date' => $this->access_date?->format('Y-m-d'),
            'user' => $user ? [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'email' => $user->email,
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
