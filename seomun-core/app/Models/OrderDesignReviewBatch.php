<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class OrderDesignReviewBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'token_hash',
        'created_by_user_id',
        'expires_at',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function versions(): BelongsToMany
    {
        return $this->belongsToMany(OrderItemDesignVersion::class, 'order_design_review_batch_versions')
            ->withTimestamps();
    }
}
