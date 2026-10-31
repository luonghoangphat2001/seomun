<?php

namespace App\Http\Resources\Admin;

use App\Enums\ApprovalStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AdminCustomerDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // =========================
            // Basic Information (기본정보)
            // =========================
            'id' => $this->id,
            'access_code' => $this->access_code,
            'company_name' => $this->company_name,
            'representative_name' => $this->representative_name,
            'business_registration_number' => $this->business_registration_number,
            'business_type' => $this->business_type,
            'business_items' => $this->business_items,
            'site_version' => $this->site_version?->value ?? $this->site_version,

            // =========================
            // Business Address (사업장 주소)
            // =========================
            'postcode' => $this->postcode,
            'address' => $this->address,
            'detailed_address' => $this->detailed_address,
            'full_address' => $this->getFullAddress(),

            // =========================
            // Contact Information (연락처 정보)
            // =========================
            'tax_invoice_email' => $this->tax_invoice_email,
            'homepage_url' => $this->homepage_url,

            // =========================
            // Contact Information (연락처 정보)
            // =========================
            'contact_name' => $this->contact_name,
            'contact_position' => $this->contact_position,
            'contact_phone' => $this->contact_phone,
            'contact_mobile' => $this->contact_mobile,
            'contact_fax' => $this->contact_fax,
            'contact_email' => $this->contact_email,

            // =========================
            // Sales / Branch Information
            // =========================
            'branch_in_charge' => [
                'code' => $this?->code?->code,
                'name' => $this?->code?->name,
            ],
            'sales_representative_name' => $this->sales_representative_name,
            'sales_representative_contact' => $this->sales_representative_contact,
            'mro_customer_code' => $this->mro_customer_code,

            // =========================
            // Menu / Ordering Settings
            // =========================
            'main_menu' => $this->main_menu,
            'order_menus' => $this->order_menus,
            'other_menus' => $this->other_menus,

            // =========================
            // Order & Notification Settings
            // =========================
            'order_notification' => [
                'enabled' => $this->order_notification_enabled,
                'phone' => $this->order_notification_phone,
                'email' => $this->order_notification_email,
                'simple_order_sms_enabled' => $this->simple_order_sms_notification_enabled,
                'simple_order_sms_phone' => $this->simple_order_sms_notification_phone,
                'teams_notification_enabled' => $this->order_teams_notification_enabled,
            ],

            // =========================
            // Shipping Information
            // =========================
            'shipping' => [
                'shipping_fee_applied' => $this->shipping_fee_applied,
                'shipping_method' => $this->shipping_method,
                'shipping_fee' => $this->shipping_fee,
                'shipping_fee_type' => $this->shipping_fee_type,
                'free_shipping_min_order_amount' => $this->free_shipping_min_order_amount,
            ],

            // =========================
            // Payment Information
            // =========================
            'payment_info' => [
                'postpaid_payment_enabled' => $this->postpaid_payment_enabled,
                'prepaid_payment_enabled' => $this->prepaid_payment_enabled,
                'prepaid_payment_methods' => $this->prepaid_payment_methods,
                'delivery_confirmation_step_enabled' => $this->delivery_confirmation_step_enabled,
            ],

            // =========================
            // Member / Signup Settings
            // =========================
            'member_settings' => [
                'member_approval_required' => $this->member_approval_required,
                'signup_enabled' => $this->signup_enabled,
                'signup_approval_email_enabled' => $this->signup_approval_email_enabled,
                'signup_approval_email' => $this->signup_approval_email,
                'signup_approval_sms_enabled' => $this->signup_approval_sms_enabled,
                'signup_approval_phone' => $this->signup_approval_phone,
                'signup_approval_result_email_enabled' => $this->signup_approval_result_email_enabled,
            ],

            // =========================
            // Organization Structure
            // =========================
            'organization' => [
                'level_1_name' => $this->org_level_1_name,
                'level_2_name' => $this->org_level_2_name,
                'level_3_name' => $this->org_level_3_name,
            ],

            // =========================
            // Branding / UI
            // =========================
            'branding' => [
                'header_title' => $this->customer_header_title,
                'skin' => $this->customer_skin,
                'footer_contact_number_1' => $this->customer_footer_contact_number_1,
                'footer_contact_number_2' => $this->customer_footer_contact_number_2,
                'footer_copyright' => $this->customer_footer_copyright,
            ],
            'logos' => [
                'v3_common' => $this->logo_v3_common
                    ? Storage::disk('public')->url($this->logo_v3_common)
                    : null,
                'v2_header' => $this->logo_v2_header
                    ? Storage::disk('public')->url($this->logo_v2_header)
                    : null,
                'v2_login' => $this->logo_v2_login
                    ? Storage::disk('public')->url($this->logo_v2_login)
                    : null,
            ],

            // =========================
            // Commission Rates
            // =========================
            'commission' => [
                'cloud_card' => $this->commission_cloud_card,
                'office_printing' => $this->commission_office_printing,
                'pro_order' => $this->commission_pro_order,
                'custom_product' => $this->commission_custom_product,
                'promo_material' => $this->commission_promo_material,
                'name_tag' => $this->commission_name_tag,
                'large_format_print' => $this->commission_large_format_print,
                'file_order' => $this->commission_file_order,
            ],

            // =========================
            // Flags
            // =========================
            'flags' => [
                'is_mro' => $this->is_mro,
                'is_franchise' => $this->is_franchise,
                'is_partner' => $this->is_partner,
                'is_seomun_graphics_branch' => $this->is_seomun_graphics_branch,
                'tcps_enabled' => $this->tcps_enabled,
                'document_upload_enabled' => $this->document_upload_enabled,
            ],

            // =========================
            // Status Information
            // =========================
            'status' => [
                'value' => $this->status ?? 'active',
                'label' => $this->getStatusLabel(),
            ],
            'approval_status' => [
                'value' => $this->approval_status?->value ?? null,
                'label' => $this->getApprovalStatusLabel(),
            ],

            // =========================
            // Approval Information
            // =========================
            'approved_at' => $this->approved_at?->format('Y-m-d H:i:s'),
            'approved_by' => $this->approvedBy ? [
                'id' => $this->approvedBy->id,
                'name' => $this->approvedBy->name,
                'username' => $this->approvedBy->username,
            ] : null,

            // =========================
            // Master User Account
            // =========================
            'master_user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'username' => $this->user->username,
                'email' => $this->user->email,
                'mobile' => $this->user->mobile,
                'name' => $this->user->name,
            ] : null),

            // =========================
            // Users
            // =========================
            'users' => AdminMemberResource::collection($this->whenLoaded('users')),

            // =========================
            // Editable Fields (unchanged)
            // =========================
            'editable_fields' => [
                'company_name' => true,
                'representative_name' => true,
                'business_registration_number' => false, // Usually not editable
                'contact_name' => true,
                'contact_phone' => true,
                'contact_email' => true,
                'postcode' => true,
                'address' => true,
                'detailed_address' => true,
            ],

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
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
