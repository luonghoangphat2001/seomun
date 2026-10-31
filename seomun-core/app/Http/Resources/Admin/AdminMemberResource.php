<?php

namespace App\Http\Resources\Admin;

use App\Enums\UserStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminMemberResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,
            'mobile' => $this->mobile,
            'member_type' => $this->member_type,
            'company_name' => $this->company_name,
            'note' => $this->note,
            'status' => [
                'value' => $this->status?->value,
                'label' => $this->getStatusLabel(),
            ],
            'approval_status' => [
                'value' => $this->approval_status?->value,
                'label' => $this->approval_status?->label(),
            ],
            'authority' => [
                'value' => $this->authority,
                'label' => $this->getAuthorityLabel(),
            ],
            'date_of_joining' => $this->created_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Get status label
     */
    private function getStatusLabel(): string
    {
        return match ($this->status) {
            UserStatus::ACTIVE => 'Active',
            UserStatus::INACTIVE => 'Deactive',
            UserStatus::BLOCKED => 'Blocked',
            default => 'Unknown',
        };
    }

    /**
     * Get authority label
     */
    private function getAuthorityLabel(): string
    {
        return match ($this->authority) {
            'master' => '마스터권한',
            'employee' => '사원권한',
            'team_approval' => '팀 결재권한',
            'business_office_approval' => '사업소 결재권한',
            'headquarters_approval' => '본부 결재권한',
            default => $this->authority ?? 'N/A',
        };
    }
}
