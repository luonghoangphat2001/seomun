<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderShippingAddressHistory extends Model
{
    protected $fillable = [
        'order_id',
        'address_book_id',
        'changed_at',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'changed_at' => 'datetime',
            'payload' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function addressBook(): BelongsTo
    {
        return $this->belongsTo(AddressBook::class, 'address_book_id');
    }
}
