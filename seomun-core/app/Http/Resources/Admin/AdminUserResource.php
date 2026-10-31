<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Admin\AdminUserPermissionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Basic info
            'username' => $this->username,
            'name' => $this->name,
            'email' => $this->email,

            // Contact
            'phone' => $this->phone,
            'mobile' => $this->mobile,

            // Status & authority
            'status' => $this->status?->value,
            'authority' => $this->authority,

            // Address
            'postcode' => $this->postcode,
            'address' => $this->address,
            'detailed_address' => $this->detailed_address,

            // Organization
            'headquarters' => $this->headquarters,
            'business_office' => $this->business_office,
            'team' => $this->team,
            'position' => $this->position,
            'department' => $this->department,
            'hire_date' => $this->hire_date?->format('Y-m-d'),
            'resignation_date' => $this->resignation_date?->format('Y-m-d'),

            // Bank Account
            'bank_name' => $this->bank_name,
            'account_number' => $this->account_number,

            // Agreements
            'agree_privacy' => $this->agree_privacy,
            'agree_terms' => $this->agree_terms,
            'agreed_at' => $this->agreed_at?->toISOString(),
            'email_verified_at' => $this->email_verified_at?->toISOString(),

            // Login info
            'last_login_at' => $this->last_login_at?->toISOString(),
            'last_login_ip' => $this->last_login_ip,

            // Admin Permissions
            'admin_permissions' => AdminUserPermissionResource::collection($this->whenLoaded('adminPermissions')),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
