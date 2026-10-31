<?php

namespace Database\Factories;

use App\Enums\ApprovalStatus;
use App\Enums\UserAuthority;
use App\Models\Code;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'access_code' => fake()->lexify('????????'),
            'is_seomun_graphics_branch' => fake()->boolean(),
            'company_name' => fake()->company(),
            'business_registration_number' => fake()->lexify('????????????'),
            'representative_name' => fake()->name(),
            'contact_name' => fake()->name(),
            'contact_position' => fake()->jobTitle(),
            'contact_phone' => fake()->phoneNumber(),
            'contact_email' => fake()->safeEmail(),
            'contact_mobile' => fake()->phoneNumber(),
            'contact_fax' => fake()->phoneNumber(),
            'order_menus' => fake()->words(3, true),
            'other_menus' => fake()->words(3, true),
            'main_menu' => fake()->words(3, true),
            'mro_customer_code' => fake()->lexify('????????'),
            'branch_in_charge' => Code::inRandomOrder()->value('id'),
            'sales_representative_name' => fake()->name(),
            'sales_representative_contact' => fake()->phoneNumber(),
            'customer_header_title' => fake()->words(3, true),
            'customer_skin' => fake()->words(3, true),
            'customer_footer_contact_number_1' => fake()->phoneNumber(),
            'customer_footer_contact_number_2' => fake()->phoneNumber(),
            'customer_footer_copyright' => fake()->words(3, true),
            'order_notification_enabled' => fake()->boolean(),
            'order_notification_phone' => fake()->phoneNumber(),
            'order_notification_email' => fake()->safeEmail(),
            'simple_order_sms_notification_enabled' => fake()->boolean(),
            'simple_order_sms_notification_phone' => fake()->phoneNumber(),
            'order_teams_notification_enabled' => fake()->boolean(),
            'postcode' => fake()->postcode(),
            'address' => fake()->address(),
            'business_type' => fake()->words(3, true),
            'business_items' => fake()->words(3, true),
            'shipping_fee_applied' => fake()->boolean(),
            'shipping_method' => fake()->words(3, true),
            'shipping_fee' => fake()->randomFloat(2, 0, 10000),
            'shipping_fee_type' => fake()->words(3, true),
            'free_shipping_min_order_amount' => fake()->randomFloat(2, 0, 10000),
            'postpaid_payment_enabled' => fake()->boolean(),
            'prepaid_payment_enabled' => fake()->boolean(),
            'prepaid_payment_methods' => fake()->words(3, true),
            'delivery_confirmation_step_enabled' => fake()->boolean(),
            'order_history_retention_days' => fake()->randomNumber(2),
            'tcps_enabled' => fake()->boolean(),
            'member_approval_required' => fake()->boolean(),
            'signup_approval_email_enabled' => fake()->boolean(),
            'signup_approval_email' => fake()->safeEmail(),
            'signup_approval_sms_enabled' => fake()->boolean(),
            'signup_approval_phone' => fake()->phoneNumber(),
            'signup_approval_result_email_enabled' => fake()->boolean(),
            'site_version' => fake()->words(3, true),
            'signup_enabled' => fake()->boolean(),
            'org_level_1_name' => fake()->words(3, true),
            'org_level_2_name' => fake()->words(3, true),
            'org_level_3_name' => fake()->words(3, true),
            'logo_v3_common' => fake()->image(),
            'logo_v2_header' => fake()->image(),
            'logo_v2_login' => fake()->image(),
            'document_upload_enabled' => fake()->boolean(),
            'is_mro' => fake()->boolean(),
            'is_franchise' => fake()->boolean(),
            'is_partner' => fake()->boolean(),
            'commission_cloud_card' => fake()->randomFloat(2, 0, 2),
            'commission_office_printing' => fake()->randomFloat(2, 0, 2),
            'commission_pro_order' => fake()->randomFloat(2, 0, 2),
            'commission_custom_product' => fake()->randomFloat(2, 0, 2),
            'commission_promo_material' => fake()->randomFloat(2, 0, 2),
            'commission_name_tag' => fake()->randomFloat(2, 0, 2),
            'commission_large_format_print' => fake()->randomFloat(2, 0, 2),
            'commission_file_order' => fake()->randomFloat(2, 0, 2),
            'status' => fake()->words(3, true),
            'approval_status' => ApprovalStatus::default()->value,
            'approved_at' => fake()->dateTimeBetween('-1 year', '+1 year'),
            'approved_by' => UserFactory::new()->userAuthority(UserAuthority::STORE_ADMIN)->create()->id,
        ];
    }
}
