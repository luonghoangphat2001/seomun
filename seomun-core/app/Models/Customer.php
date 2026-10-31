<?php

namespace App\Models;

use App\Enums\ApprovalRequestType;
use App\Enums\ApprovalStatus;
use App\Enums\CustomerStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Customer extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'access_code',
        'is_seomun_graphics_branch',
        'company_name',
        'business_registration_number',
        'representative_name',
        'contact_name',
        'contact_position',
        'contact_phone',
        'contact_email',
        'contact_mobile',
        'contact_fax',
        'tax_invoice_email',
        'homepage_url',
        'business_registration_file',
        'order_menus',
        'other_menus',
        'main_menu',
        'mro_customer_code',
        'branch_in_charge',
        'sales_representative_name',
        'sales_representative_contact',
        'customer_header_title',
        'customer_skin',
        'customer_footer_contact_number_1',
        'customer_footer_contact_number_2',
        'customer_footer_copyright',
        'order_notification_enabled',
        'order_notification_phone',
        'order_notification_email',
        'simple_order_sms_notification_enabled',
        'simple_order_sms_notification_phone',
        'order_teams_notification_enabled',
        'postcode',
        'address',
        'detailed_address',
        'business_type',
        'business_items',
        'industry_type',
        'shipping_fee_applied',
        'shipping_method',
        'shipping_fee',
        'shipping_fee_type',
        'free_shipping_min_order_amount',
        'postpaid_payment_enabled',
        'prepaid_payment_enabled',
        'prepaid_payment_methods',
        'delivery_confirmation_step_enabled',
        'order_history_retention_days',
        'tcps_enabled',
        'member_approval_required',
        'signup_approval_email_enabled',
        'signup_approval_email',
        'signup_approval_sms_enabled',
        'signup_approval_phone',
        'signup_approval_result_email_enabled',
        'site_version',
        'signup_enabled',
        'org_level_1_name',
        'org_level_2_name',
        'org_level_3_name',
        'logo_v3_common',
        'logo_v2_header',
        'logo_v2_login',
        'document_upload_enabled',
        'is_mro',
        'is_franchise',
        'is_partner',
        'api_key',
        'webhook_secret',
        'commission_cloud_card',
        'commission_office_printing',
        'commission_pro_order',
        'commission_custom_product',
        'commission_promo_material',
        'commission_name_tag',
        'commission_large_format_print',
        'commission_file_order',
        'status',
        'approval_status',
        'approval_request_type',
        'approved_at',
        'approved_by',
        'rejected_by',
        'rejected_at',
        'rejected_reason',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'approval_status' => ApprovalStatus::class,
            'approval_request_type' => ApprovalRequestType::class,
            'status' => CustomerStatus::class,
            'shipping_method' => 'array',
            'prepaid_payment_methods' => 'array',
            'order_menus' => 'array',
            'other_menus' => 'array',
            'rejected_at' => 'datetime',
        ];
    }

    /**
     * Get the admin user who approved this customer.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    /**
     * Get the users (members) belonging to this customer.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'customer_id');
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(User::class, 'customer_id')->oldestOfMany();
    }

    public function code(): BelongsTo
    {
        return $this->belongsTo(Code::class, 'branch_in_charge');
    }

    /**
     * Get customers with pending approval status
     */
    public function scopeIsPending($query)
    {
        return $query->where('approval_status', ApprovalStatus::PENDING->value);
    }

    /**
     * Get the promotional products for this customer.
     */
    public function promotionalProducts(): HasMany
    {
        return $this->hasMany(CustomerPromotionalProduct::class)->orderBy('sort_order');
    }

    /**
     * Get the products that are promoted for this customer.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'customer_promotional_products')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('customer')
            ->logOnly([
                'company_name',
                'business_registration_number',
                'representative_name',
                'contact_name',
                'contact_position',
                'contact_phone',
                'contact_mobile',
                'contact_email',
                'contact_fax',
                'postcode',
                'address',
                'detailed_address',
                'status',
                'approval_status',
                'site_version',
                'shipping_method',
                'shipping_fee',
                'shipping_fee_type',
                'prepaid_payment_enabled',
                'postpaid_payment_enabled',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Customer has been {$eventName}");
    }
}
