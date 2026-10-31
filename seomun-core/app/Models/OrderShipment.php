<?php

namespace App\Models;

use App\Enums\OrderShipmentStatus;
use App\Enums\OrderShipmentType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class OrderShipment extends Model
{
    protected $fillable = [
        'order_id',
        'type',
        'status',
        'tracking_number',
        'carrier_code',
        'carrier_name',
        'shipping_method',
        'memo',
        'shipping_fee',
        'shipping_name',
        'shipping_phone',
        'shipping_postcode',
        'shipping_address',
        'shipping_address_detail',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'type'         => OrderShipmentType::class,
        'status'       => OrderShipmentStatus::class,
        'shipping_fee' => 'decimal:2',
        'shipped_at'   => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function items(): BelongsToMany
    {
        return $this->belongsToMany(OrderItem::class, 'order_shipment_items', 'order_shipment_id', 'order_item_id')
            ->withTimestamps();
    }

    public function isCombined(): bool
    {
        return $this->type === OrderShipmentType::COMBINED;
    }

    public function isSeparate(): bool
    {
        return $this->type === OrderShipmentType::SEPARATE;
    }
}
