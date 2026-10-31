<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BulkOrderBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'name',
        'status',
        'expected_count',
        'success_count',
        'error_count',
        'excel_path',
        'configuration',
        'metadata',
    ];

    protected $casts = [
        'configuration' => 'array',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(BulkOrderEntry::class, 'batch_id');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class, 'bulk_order_batch_id');
    }
}
