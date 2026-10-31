<?php

namespace App\Http\Resources\Admin;

use App\Enums\ApprovalStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminCustomerResource extends JsonResource
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
            'company_name' => $this->company_name,
            'business_registration_number' => $this->business_registration_number,
            'access_code' => $this->access_code,
            'branch_in_charge' => [
                'code' => $this?->code?->code,
                'name' => $this?->code?->name,
            ],
            'contact_name' => $this->contact_name,
            'contact_phone' => $this->contact_phone,
            'contact_email' => $this->contact_email,
            'status' => [
                'value' => $this->status ?? 'active',
                'label' => $this->getStatusLabel(),
            ],
            'order_menus' => $this->order_menus,
            'main_menu' => $this->main_menu,
            'postpaid_payment_enabled' => $this->postpaid_payment_enabled,
            'prepaid_payment_enabled' => $this->prepaid_payment_enabled,
            'site_version' => $this->site_version,
            'approval_status' => [
                'value' => $this->approval_status?->value ?? null,
                'label' => $this->getApprovalStatusLabel(),
            ],
            'request_type' => [
                'value' => $this->approval_request_type?->value ?? null,
                'label' => $this->approval_request_type?->label() ?? null,
            ],
            'requester' => $this->relationLoaded('user') ? [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'username' => $this->user?->username,
            ] : null,
            'registration_date' => $this->created_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'processed_at' => ($this->approval_status?->isAccepted()
            ? $this->approved_at
            : ($this->approval_status?->isRejected()
                ? $this->rejected_at
                : null)
            )?->toIso8601String(),

            'processed_by' => ($this->approval_status?->isAccepted()
                ? $this->approvedBy?->name
                : ($this->approval_status?->isRejected()
                    ? $this->rejectedBy?->name
                    : null)
            ),
            'reason' => $this->rejected_reason,
        ];
    }

    /**
     * Get status label
     */
    private function getStatusLabel(): string
    {
        $status = $this->status ?? 'active';

        return match ($status) {
            'active' => 'Active',
            'deactive', 'inactive' => 'Deactive',
            default => 'N/A',
        };
    }

    /**
     * Get approval status label
     */
    private function getApprovalStatusLabel(): ?string
    {
        if (! $this->approval_status) {
            return null;
        }

        return match ($this->approval_status) {
            ApprovalStatus::ACCEPTED => 'Accept',
            ApprovalStatus::REJECTED => 'Reject',
            ApprovalStatus::PENDING => 'Pending',
            default => null,
        };
    }
}
