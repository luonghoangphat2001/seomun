<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedProductOption extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'order_name',
        'notes',
        'detail',
        'quantity',
        'number_of_cases',
        'options',
        'input_options',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'detail' => 'array',
            'options' => 'array',
            'input_options' => 'array',
            'quantity' => 'integer',
            'number_of_cases' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (SavedProductOption $model) {
            if ($model->expires_at === null) {
                $model->expires_at = now()->addYear();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeNotExpired($query)
    {
        return $query->where('expires_at', '>', now());
    }
}
