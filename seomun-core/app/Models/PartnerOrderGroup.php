<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerOrderGroup extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'group_order_number',
        'customer_id',
        'status',
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
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(PartnerOrder::class, 'order_group_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
