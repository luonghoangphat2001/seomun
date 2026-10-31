<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VirtualAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'provider',
        'account_number',
        'bank_code',
        'customer_name',
        'account_type',
        'status',
        'issued_at',
        'closed_at',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function deposits(): HasMany
    {
        return $this->hasMany(VirtualAccountDeposit::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (VirtualAccount $account) {
            if (!$account->isForceDeleting()) {
                $account->account_number .= '_' . time();
                $account->saveQuietly();
            }
        });
    }
}
