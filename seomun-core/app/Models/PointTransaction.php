<?php

namespace App\Models;

use App\Enums\PointCategory;
use App\Enums\PointTransactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'remaining_amount',
        'balance_after',
        'category',
        'order_id',
        'reference_id',
        'parent_id',
        'expired_at',
        'description',
        'created_by',
    ];

    protected $casts = [
        'type' => PointTransactionType::class,
        'category' => PointCategory::class,
        'amount' => 'integer',
        'remaining_amount' => 'integer',
        'balance_after' => 'integer',
        'parent_id' => 'integer',
        'expired_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(PointTransaction::class, 'parent_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function scopeType($query, PointTransactionType $type)
    {
        return $query->where('type', $type->value);
    }

    public function scopeCategory($query, PointCategory $category)
    {
        return $query->where('category', $category->value);
    }

    public function isPositive(): bool
    {
        return $this->type->isPositive();
    }
}
