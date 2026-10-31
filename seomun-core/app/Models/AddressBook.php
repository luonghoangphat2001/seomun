<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AddressBook extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'recipient',
        'phone',
        'mobile',
        'email',
        'postcode',
        'address',
        'detailed_address',
        'is_default',
        'delivery_message',
        'delivery_message_preset',
        'delivery_message_custom',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * Get the user that owns the address book entry.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
