<?php

namespace Database\Seeders;

use App\Enums\UserAuthority;
use App\Models\Code;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PartnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find or create a branch code (default to first available if not found)
        $branchCode = Code::first();
        if (! $branchCode) {
            $branchCode = Code::create([
                'code' => 'BRANCH001',
                'name' => 'Default Branch',
            ]);
        }

        // Create DPTIA customer
        $customer = Customer::firstOrCreate(
            ['business_registration_number' => 'DPTIA2026'],
            [
                'access_code' => 'DPTIA',
                'is_seomun_graphics_branch' => false,
                'company_name' => 'DPTIA Production',
                'representative_name' => 'DPTIA Representative',
                'contact_name' => 'DPTIA Contact',
                'contact_position' => 'Production Manager',
                'contact_phone' => '031-123-4567',
                'contact_email' => 'contact@dptia.com',
                'contact_mobile' => '010-1234-5678',
                'contact_fax' => '031-123-4568',
                'order_menus' => json_encode(['menu1', 'menu2', 'menu3']),
                'other_menus' => json_encode(['menu4', 'menu5']),
                'main_menu' => 'menu1',
                'mro_customer_code' => 'DPTIA2026',
                'branch_in_charge' => $branchCode->id,
                'sales_representative_name' => 'DPTIA Sales Rep',
                'sales_representative_contact' => '010-9876-5432',
                'customer_header_title' => 'DPTIA Production',
                'customer_skin' => 'default',
                'customer_footer_contact_number_1' => '031-123-4567',
                'customer_footer_contact_number_2' => '031-123-4568',
                'customer_footer_copyright' => 'Copyright(c) DPTIA All rights reserved.',
                'order_notification_enabled' => true,
                'order_notification_phone' => '031-123-4567',
                'order_notification_email' => 'notifications@dptia.com',
                'simple_order_sms_notification_enabled' => true,
                'simple_order_sms_notification_phone' => '010-1234-5678',
                'order_teams_notification_enabled' => false,
                'postcode' => '12345',
                'address' => 'Seoul, South Korea',
                'detailed_address' => '123 Main Street, Building A',
                'business_type' => 'Production',
                'business_items' => 'Printing, Production',
                'shipping_fee_applied' => true,
                'shipping_method' => json_encode(['courier']),
                'shipping_fee' => 5000,
                'shipping_fee_type' => 'fixed',
                'free_shipping_min_order_amount' => 100000,
                'postpaid_payment_enabled' => true,
                'prepaid_payment_enabled' => true,
                'prepaid_payment_methods' => json_encode(['credit_card', 'bank_transfer']),
                'delivery_confirmation_step_enabled' => true,
                'order_history_retention_days' => 365,
                'tcps_enabled' => true,
                'member_approval_required' => true,
                'signup_approval_email_enabled' => true,
                'signup_approval_email' => 'approval@dptia.com',
                'signup_approval_sms_enabled' => true,
                'signup_approval_phone' => '010-1234-5678',
                'signup_approval_result_email_enabled' => true,
                'site_version' => 'v3',
                'signup_enabled' => true,
                'org_level_1_name' => 'Department',
                'org_level_2_name' => 'Team',
                'org_level_3_name' => 'Position',
                'document_upload_enabled' => true,
                'is_mro' => false,
                'is_franchise' => false,
                'is_partner' => true,
                'api_key' => Str::random(64),
                'webhook_secret' => Str::random(64),
                'commission_cloud_card' => '0.05',
                'commission_office_printing' => '0.03',
                'commission_pro_order' => '0.04',
                'commission_custom_product' => '0.05',
                'commission_promo_material' => '0.03',
                'commission_name_tag' => '0.02',
                'commission_large_format_print' => '0.06',
                'commission_file_order' => '0.04',
                'status' => 'active',
                'approval_status' => 'accepted',
                'approved_at' => now(),
            ]
        );

        // Create admin user for DPTIA
        User::firstOrCreate(
            ['username' => 'dptia_admin'],
            [
                'customer_id' => $customer->id,
                'name' => 'DPTIA Admin',
                'email' => 'admin@dptia.com',
                'password' => Hash::make('dptia@2026'),
                'phone' => '031-123-4567',
                'mobile' => '010-1234-5678',
                'postcode' => '12345',
                'address' => 'Seoul, South Korea',
                'detailed_address' => '123 Main Street, Building A',
                'authority' => UserAuthority::PARTNER->value,
                'headquarters' => 'DPTIA HQ',
                'business_office' => 'Production',
                'team' => 'Admin',
                'position' => 'Manager',
                'agree_privacy' => true,
                'agree_terms' => true,
                'agreed_at' => now(),
                'status' => 'active',
                'approval_status' => 'accepted',
                'approved_at' => now(),
            ]
        );

        $this->command->info('DPTIA partner created successfully with:');
        $this->command->info('API Key: '.$customer->api_key);
        $this->command->info('Webhook Secret: '.$customer->webhook_secret);
        $this->command->info('Admin Username: dptia_admin');
        $this->command->info('Admin Password: dptia@2026');
    }
}
