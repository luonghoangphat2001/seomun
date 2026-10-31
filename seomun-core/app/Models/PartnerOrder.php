<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerOrder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_number',
        'order_external_number',
        'customer_id',
        'product_name',
        'status',
        'payment_status',
        'currency',
        'subtotal_amount',
        'tax_amount',
        'shipping_fee',
        'total_amount',
        'placed_at',
        'contact_name',
        'contact_tel',
        'contact_phone',
        'contact_phone2',
        'contact_email',
        'sender_name',
        'sender_phone',
        'sender_zipcode',
        'sender_address',
        'sender_address2',
        'shipping_name',
        'shipping_phone',
        'shipping_phone2',
        'shipping_postcode',
        'shipping_address',
        'shipping_address_detail',
        'shipping_method',
        'shipping_time',
        'metadata',
        'order_group_id',
        'order_sequence',
        'design_file_url',
        'design_file_local',
    ];

    protected $casts = [
        'placed_at' => 'datetime',
        'metadata' => 'array',
        'subtotal_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    // Relationships

    public function items(): HasMany
    {
        return $this->hasMany(PartnerOrderItem::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function orderGroup(): BelongsTo
    {
        return $this->belongsTo(PartnerOrderGroup::class, 'order_group_id');
    }

    /**
     * Display order number for admin UI: "BO202603180001-1"
     * Falls back to order_number if not yet assigned to a group.
     */
    public function getDisplayOrderNumberAttribute(): string
    {
        if ($this->order_group_id && $this->order_sequence && $this->relationLoaded('orderGroup')) {
            return $this->orderGroup->group_order_number.'-'.$this->order_sequence;
        }

        return $this->order_number;
    }
}
