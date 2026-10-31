<?php

namespace App\Http\Resources\Admin;

use App\Enums\UserStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminMemberDetailResource extends JsonResource
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

            // Contact Information (연락처)
            'phone' => $this->phone,
            'mobile' => $this->mobile,

            // Address Information (배송주소)
            'postcode' => $this->postcode,
            'address' => $this->address,
            'detailed_address' => $this->detailed_address,
            'full_address' => $this->getFullAddress(),
            'member_type' => $this->member_type,
            'company_name' => $this->company_name,
            'note' => $this->note,

            // Order and loyalty-point summary
            'total_orders' => (int) ($this->total_orders ?? 0),
            'completed_amount' => (int) ($this->completed_amount ?? 0),
            'points' => (int) ($this->pointBalance?->balance ?? 0),

            // Bussiness
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'company_name' => $this->customer->company_name,
                    'business_registration_number' => $this->customer->business_registration_number,
                    'representative_name' => $this->customer->representative_name,
                    'industry_type' => $this->customer->industry_type,
                    'business_type' => $this->customer->business_type,
                    'postcode' => $this->customer->postcode,
                    'address' => $this->customer->address,
                    'detailed_address' => $this->customer->detailed_address,
                    'tax_invoice_email' => $this->customer->tax_invoice_email,
                    'homepage_url' => $this->customer->homepage_url,
                    'business_registration_file' => $this->customer->business_registration_file,
                ];
            }),
            // Status Information
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

            // Dates
            'date_of_joining' => $this->created_at?->format('Y-m-d H:i:s'),
            'agreed_at' => $this->agreed_at?->format('Y-m-d H:i:s'),
            'approved_at' => $this->approved_at?->format('Y-m-d H:i:s'),
            'approved_by' => $this->approvedBy ? [
                'id' => $this->approvedBy->id,
                'name' => $this->approvedBy->name,
                'username' => $this->approvedBy->username,
            ] : null,

            'membership_tier' => $this->membershipTier ? [
                'id' => $this->membershipTier->id,
                'name' => $this->membershipTier->name,
            ] : null,

            'refund_bank' => $this->refund_bank,
            'refund_account_number' => $this->refund_account_number,
            'refund_account_name' => $this->refund_account_name,

            'virtual_account' => $this->whenLoaded('virtualAccount', function () {
                return $this->virtualAccount ? [
                    'provider' => $this->virtualAccount->provider,
                    'account_number' => $this->virtualAccount->account_number,
                    'bank_code' => $this->virtualAccount->bank_code,
                    'customer_name' => $this->virtualAccount->customer_name,
                    'status' => $this->virtualAccount->status,
                ] : null;
            }),

            // Terms Agreement
            'agree_privacy' => $this->agree_privacy,
            'agree_terms' => $this->agree_terms,

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
            UserStatus::ACTIVE => '활성',
            UserStatus::INACTIVE => '비활성',
            UserStatus::BLOCKED => '차단',
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

    /**
     * Get full address
     */
    private function getFullAddress(): ?string
    {
        if (! $this->postcode && ! $this->address && ! $this->detailed_address) {
            return null;
        }

        $parts = array_filter([
            $this->postcode,
            $this->address,
            $this->detailed_address,
        ]);

        return ! empty($parts) ? implode(' ', $parts) : null;
    }
}
