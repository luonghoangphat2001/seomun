<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminEquipmentLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'equipment_id'        => $this->equipment_id,
            'log_date'            => $this->log_date?->toDateString(),
            'maintenance_details' => $this->maintenance_details,
            'special_notes'       => $this->special_notes,
            'cost_type'           => $this->cost_type,
            'manager'             => $this->manager,
            'created_at'          => $this->created_at?->toISOString(),
        ];
    }
}
