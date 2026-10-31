<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminEquipmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'company_name'        => $this->company_name,
            'name'                => $this->name,
            'machine_type'        => $this->machine_type?->value ?? $this->machine_type,
            'maintenance_company' => $this->maintenance_company,
            'manager_name'        => $this->manager_name,
            'manager_phone'       => $this->manager_phone,
            'introduced_at'       => $this->introduced_at?->toDateString(),
            'image'               => $this->image,
            'work_process'        => $this->work_process,
            'status'              => $this->status,
            'notes'               => $this->notes,
            'created_at'          => $this->created_at?->toISOString(),
            'updated_at'          => $this->updated_at?->toISOString(),
        ];
    }
}
