<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
    ];

    /**
     * Get the user that owns the cart.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for the cart.
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class)->orderBy('created_at');
    }

    /**
     * Get or create cart for user.
     */
    public static function getOrCreateForUser(int $userId): self
    {
        return static::firstOrCreate(['user_id' => $userId]);
    }

    /**
     * Calculate total price of all items in cart.
     */
    public function getTotalPriceAttribute(): float
    {
        // CartItem::getSubtotalAttribute() already uses (price per case) × (number_of_cases).
        return (float) $this->items->sum(fn ($item) => (float) $item->subtotal);
    }

    /**
     * Calculate total quantity of all items in cart.
     */
    public function getTotalQuantityAttribute(): int
    {
        // Total quantity should account for number_of_cases (multiplier).
        return (int) $this->items->sum(fn ($item) => (int) $item->total_quantity);
    }
}
