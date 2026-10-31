<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerOrderItem extends Model
{
    protected $fillable = [
        'partner_order_id',
        'title',
        'quantity',
        'unit_price',
        'total_price',
        'configuration',
        'notes',
    ];

    protected $casts = [
        'configuration' => 'array',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function partnerOrder(): BelongsTo
    {
        return $this->belongsTo(PartnerOrder::class);
    }
}
