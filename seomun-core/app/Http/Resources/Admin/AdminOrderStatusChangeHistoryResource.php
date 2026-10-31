<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderStatusChangeHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'old_status' => $this->old_status,
            'new_status' => $this->new_status,
            'changed_by' => $this->whenLoaded('changedBy', function () {
                return $this->changedBy ? [
                    'id' => $this->changedBy->id,
                    'name' => $this->changedBy->name ?? null,
                    'email' => $this->changedBy->email ?? null,
                    'username' => $this->changedBy->username ?? null,
                ] : null;
            }),
            'note' => $this->note,
            'change_at' => $this->change_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
