<?php

use App\Enums\ApprovalStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            // 1. Primary Identification
            $table->id();
            $table->boolean('is_seomun_graphics_branch')->default(false);
            $table->string('access_code', 20)->unique()->comment('Access code for the customer login');
            $table->string('api_key')->unique()->nullable();
            $table->string('webhook_secret')->unique()->nullable();
            $table->string('site_version')->default('legacy')->comment('System version: legacy, v2, v3');

            // 2. Basic Business Information
            $table->string('company_name')->index()->comment('Customer company name');
            $table->string('business_registration_number')->unique()->nullable()->index()->comment('Business tax ID');
            $table->string('representative_name')->nullable();
            $table->string('business_type')->nullable();
            $table->string('business_items')->nullable();
            $table->string('mro_customer_code')->nullable()->comment('Internal MRO system code');

            // 3. Contact & Personnel
            $table->string('contact_name')->nullable();
            $table->string('contact_position')->nullable();
            $table->string('contact_phone', 20)->nullable();
            $table->string('contact_mobile')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_fax')->nullable();

            // 4. Address Information
            $table->string('postcode', 10)->nullable();
            $table->string('address')->nullable();
            $table->string('detailed_address')->nullable();

            // 5. Approval & Status
            $table->string('status')->default('normal')->index()->comment('Status: normal, pending, inactive');
            $table->string('approval_status')->default(ApprovalStatus::PENDING->value)->index()->comment('pending, accepted, rejected');

            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamp('rejected_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejected_reason')->nullable();

            // 6. UI & Branding Settings
            $table->string('customer_skin')->default('basic');
            $table->string('customer_header_title')->nullable();
            $table->string('customer_footer_copyright')->nullable();
            $table->string('customer_footer_contact_number_1')->nullable();
            $table->string('customer_footer_contact_number_2')->nullable();
            $table->string('logo_v3_common')->nullable();
            $table->string('logo_v2_header')->nullable();
            $table->string('logo_v2_login')->nullable();

            // 7. Shipping & Payment Configuration
            $table->string('shipping_method')->nullable();
            $table->string('shipping_fee_type')->nullable();
            $table->string('shipping_fee_applied')->comment('Logic for applying shipping fees');
            $table->decimal('shipping_fee', 12, 2)->default(0);
            $table->integer('free_shipping_min_order_amount')->nullable();

            $table->boolean('postpaid_payment_enabled')->default(true);
            $table->boolean('prepaid_payment_enabled')->default(false);
            $table->string('prepaid_payment_methods')->nullable()->comment('Comma separated methods');

            // 8. Order & System Workflow
            $table->string('main_menu')->nullable();
            $table->string('order_menus')->comment('Enabled order menu list');
            $table->string('other_menus')->comment('Secondary menu list');
            $table->boolean('delivery_confirmation_step_enabled')->default(false);
            $table->decimal('order_history_retention_days')->default(7)->nullable();
            $table->boolean('tcps_enabled')->default(true)->comment('TCPS integration status');
            $table->boolean('document_upload_enabled')->default(false);

            // 9. Membership & Signup Settings
            $table->boolean('signup_enabled')->default(true);
            $table->boolean('member_approval_required')->default(false);
            $table->boolean('signup_approval_email_enabled')->default(false);
            $table->string('signup_approval_email')->nullable();
            $table->boolean('signup_approval_sms_enabled')->default(false);
            $table->string('signup_approval_phone')->nullable();
            $table->boolean('signup_approval_result_email_enabled')->default(false);

            // 10. Notifications (SMS/Teams/Email)
            $table->boolean('order_notification_enabled')->default(false);
            $table->string('order_notification_phone')->nullable();
            $table->string('order_notification_email')->nullable();
            $table->boolean('simple_order_sms_notification_enabled')->default(false);
            $table->string('simple_order_sms_notification_phone')->nullable();
            $table->boolean('order_teams_notification_enabled')->default(false);

            // 11. Organization & Sales
            $table->string('org_level_1_name')->nullable();
            $table->string('org_level_2_name')->nullable();
            $table->string('org_level_3_name')->nullable();
            $table->string('sales_representative_name')->nullable();
            $table->string('sales_representative_contact')->nullable();

            // 12. Classification & Commission
            $table->boolean('is_mro')->default(false);
            $table->boolean('is_franchise')->default(true);
            $table->boolean('is_partner')->default(false);
            $table->string('commission_cloud_card')->nullable();
            $table->string('commission_office_printing')->nullable();
            $table->string('commission_pro_order')->nullable();
            $table->string('commission_custom_product')->nullable();
            $table->string('commission_promo_material')->nullable();
            $table->string('commission_name_tag')->nullable();
            $table->string('commission_large_format_print')->nullable();
            $table->string('commission_file_order')->nullable();

            // 13. System Logs
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('customer_id')
                ->nullable()
                ->after('id')
                ->constrained('customers')
                ->nullOnDelete()
                ->comment('Reference to the associated customer entity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop foreign key first, then drop the column
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
        });
        Schema::dropIfExists('customers');
    }
};
