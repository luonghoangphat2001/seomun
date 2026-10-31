<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserPermissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $status = $this->status ?? 'active';

        return [
            'id' => $this->id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'username' => $this->user->username,
                    'email' => $this->user->email,
                ];
            }),
            'admin_permission_id' => $this->admin_permission_id,
            'customer' => $this->whenLoaded('user', function () {
                $customer = $this->user?->customer;

                return $customer ? [
                    'id' => $customer->id,
                    'company_name' => $customer->company_name,
                ] : null;
            }),
            'permission' => $this->whenLoaded('adminPermission', function () {
                return [
                    'id' => $this->adminPermission->id,
                    'name' => $this->adminPermission->name,
                    'description' => $this->adminPermission->description,
                ];
            }),
            'status' => [
                'value' => $status,
                'label' => $status === 'active' ? 'Active' : 'Inactive',
            ],
            'grant_date' => $this->grant_date?->format('Y-m-d'),
            'registrant' => $this->whenLoaded('createdBy', function () {
                return $this->createdBy ? [
                    'id' => $this->createdBy->id,
                    'username' => $this->createdBy->username,
                    'name' => $this->createdBy->name,
                ] : null;
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
