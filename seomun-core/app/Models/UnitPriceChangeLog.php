<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitPriceChangeLog extends Model
{
    protected $fillable = [
        'unit_price_item_id',
        'unit_price_item_name',
        'price_before',
        'price_after',
        'admin_id',
    ];

    protected $casts = [
        'price_before' => 'decimal:2',
        'price_after'  => 'decimal:2',
    ];

    public function unitPriceItem(): BelongsTo
    {
        return $this->belongsTo(UnitPriceItem::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
