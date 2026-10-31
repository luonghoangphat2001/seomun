<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VirtualAccountDeposit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'virtual_account_id',
        'transaction_key',
        'depositor_name',
        'amount',
        'status',
        'deposited_at',
        'raw_payload',
    ];

    protected $casts = [
        'deposited_at' => 'datetime',
        'raw_payload' => 'array',
        'amount' => 'decimal:2',
    ];

    public function virtualAccount(): BelongsTo
    {
        return $this->belongsTo(VirtualAccount::class);
    }
}
