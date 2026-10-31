<?php

namespace App\Http\Resources\Admin;

use App\Enums\UsageStatusValue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminPermissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $usageStatus = $this->usage_status ?? 'active';
        $statusEnum = UsageStatusValue::tryFrom($usageStatus) ?? UsageStatusValue::ACTIVE;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'usage_status' => [
                'value' => $statusEnum->value,
                'label' => $statusEnum->label(),
            ],
            'menu_permissions' => $this->menu_permissions,
            'registrant' => $this->whenLoaded('createdBy', function () {
                return [
                    'id' => $this->createdBy->id,
                    'username' => $this->createdBy->username,
                    'name' => $this->createdBy->name,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
