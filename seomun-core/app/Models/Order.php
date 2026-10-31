<?php

namespace App\Models;

use App\Casts\NullableEnumCast;
use App\Casts\PaymentMethodCast;
use App\Contracts\NotifiableSubject;
use App\Enums\OrderStatus;
use App\Enums\ShippingFeeType;
use App\Enums\DesignModeCode;
use App\Enums\ShippingMethod;
use App\Http\Filters\Admin\OrderFillter;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\DesignGroup;
use App\Models\OrderArtwork;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class Order extends Model implements NotifiableSubject
{
    use Filterable, HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'order_number',
        'order_external_number',
        'user_id',
        'proxy_admin_user_id',
        'worker_id',
        'payment_method',
        'product_id',
        'product_name',
        'design_mode_code',
        'design_mode_name',
        'status',
        'payment_status',
        'currency',
        'subtotal_amount',
        'discount_amount',
        'tax_amount',
        'shipping_fee',
        'total_amount',
        'estimated_production_days',
        'requested_delivery_date',
        'placed_at',
        'contact_name',
        'contact_tel',
        'contact_phone',
        'contact_phone2',
        'contact_email',
        'company_name',
        'contact_postcode',
        'contact_address',
        'contact_address_detail',
        'shipping_name',
        'shipping_phone',
        'shipping_postcode',
        'shipping_address',
        'shipping_address_detail',
        'shipping_email',
        'shipping_method',
        'shipping_fee_type',
        'shipping_branch_name',
        'shipping_time',
        'sender_name',
        'sender_phone',
        'sender_zipcode',
        'sender_address',
        'sender_address2',
        'storage_date',
        'customer_note',
        'selected_options',
        'metadata',
        'point_used',
        'shipping_message_preset',
        'shipping_message_custom',
        'point_discount',
        'additional_shipping_fee',
        'shipping_adjustment_reason',
        'shipping_adjusted_by',
        'shipping_adjusted_at',
    ];

    protected $casts = [
        'selected_options' => 'array',
        'metadata' => 'array',
        'requested_delivery_date' => 'date',
        'storage_date' => 'integer',
        'placed_at' => 'datetime',
        'subtotal_amount' => 'integer',
        'discount_amount' => 'integer',
        'tax_amount' => 'integer',
        'shipping_fee' => 'integer',
        'total_amount' => 'integer',
        'shipping_fee_type' => ShippingFeeType::class,
        'shipping_method' => ShippingMethod::class,
        'payment_method' => PaymentMethodCast::class,
        'point_used' => 'integer',
        'point_discount' => 'integer',
        'additional_shipping_fee' => 'integer',
        'shipping_adjusted_at' => 'datetime',
        'design_mode_code' => NullableEnumCast::class . ':' . DesignModeCode::class,
    ];

    public ?string $logReason = null;

    public ?string $logBatchId = null;

    protected function getFiltersClass(): string
    {
        return OrderFillter::class;
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function itemDesignWorkflows(): HasMany
    {
        return $this->hasMany(OrderItemDesignWorkflow::class);
    }

    public function artworks(): HasManyThrough
    {
        return $this->hasManyThrough(OrderArtwork::class, DesignGroup::class);
    }

    public function designGroup(): HasOne
    {
        return $this->hasOne(DesignGroup::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Administrator who placed this order while acting as the customer. */
    public function proxyAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proxy_admin_user_id');
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    public function shippingAdjustedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shipping_adjusted_by');
    }

    public function paymentTransaction(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function orderShipments(): HasMany
    {
        return $this->hasMany(OrderShipment::class);
    }

    public function deliveryTracking(): HasOne
    {
        return $this->hasOne(DeliveryTracking::class);
    }

    public function userCoupon(): HasOne
    {
        return $this->hasOne(UserCoupon::class, 'order_id');
    }

    /**
     * Snapshots written when the customer applies a saved address (배송지 변경).
     */
    public function shippingAddressHistories(): HasMany
    {
        return $this->hasMany(OrderShippingAddressHistory::class);
    }

    public function latestShippingAddressHistory(): HasOne
    {
        return $this->hasOne(OrderShippingAddressHistory::class)->latestOfMany('changed_at');
    }

    public function getRouteKeyName(): string
    {
        return 'order_number';
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                // Status
                'status',
                // Basic information fields (for modification logs)
                'company_name',
                'contact_name',
                'contact_tel',
                'contact_phone',
                'contact_email',
                'shipping_name',
                'shipping_phone',
                'shipping_postcode',
                'shipping_address',
                'shipping_address_detail',
                'payment_method',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Order has been {$eventName}");
    }

    public function tapActivity(Activity $activity): void
    {
        if ($this->logReason) {
            $activity->properties = [...$activity->properties, 'reason' => $this->logReason];
        }

        if ($this->logBatchId) {
            $activity->batch_uuid = $this->logBatchId;
            $activity->properties = [...$activity->properties, 'batch_id' => $this->logBatchId];
        }
    }

    public function getIsPaidAttribute(): bool
    {
        return in_array($this->payment_status, ['paid', 'refunded', 'partially_refunded']);
    }

    /**
     * Get orders with completed status
     */
    public function scopeIsCompleted($query)
    {
        return $query->where('status', OrderStatus::Completed);
    }

    public function setStatusAttribute(string $value): void
    {
        if (! in_array($value, OrderStatus::values(), true)) {
            throw new \InvalidArgumentException('Invalid order status provided.');
        }

        $this->attributes['status'] = $value;
    }


    public function getOrderNumber(): string
    {
        return $this->order_number;
    }
    
    // NotifiableSubject interface implementations
    public function getNotificationReference(): string
    {
        return $this->getOrderNumber();
    }
    public function getNotificationMeta(): array
    {
        return ['order_number' => $this->getOrderNumber()];
    }
    public function getNotificationPhone(): ?string
    {
        return $this->contact_phone ?? $this->shipping_phone ?? null;
    }

    public function getNotificationEmail(): ?string
    {
        return $this->contact_email ?? null;
    }
    public function getNotificationName(): string
    {
        return $this->contact_name ?? '';
    }

    public function getNotificationUserId(): ?int
    {
        return $this->user_id ? (int) $this->user_id : null;
    }
}
