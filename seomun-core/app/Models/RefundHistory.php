<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefundHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'settlement_date',
        'refund_amount',
        'account_holder',
        'bank_code',
        'account_number',
        'deposit_date',
        'status',
        'note',
    ];

    protected $casts = [
        'settlement_date' => 'date',
        'deposit_date' => 'date',
        'refund_amount' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
