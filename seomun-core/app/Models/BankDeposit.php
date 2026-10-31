<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankDeposit extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['account_identity'];

    protected $casts = [
        'amount' => 'decimal:2',
        'remarks' => 'array',
        'deposited_at' => 'datetime',
        'matched_at' => 'datetime',
    ];
}
