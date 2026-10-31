<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DirectShippingRequest extends Model
{
    protected $fillable = [
        'user_id',
        'shipping_name',
        'recipient_name',
        'phone',
        'postcode',
        'address',
        'detailed_address',
        'storage_location',
        'file_path',
        'file_name',
        'detail_request',
        'amount',
        'status',
    ];

    protected $casts = [
        'status' => \App\Enums\DirectShippingStatus::class,
        'amount' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
