<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'min_order_amount',
        'max_discount_amount',
        'usage_limit',
        'usage_count',
        'claim_starts_at',
        'claim_ends_at',
        'starts_at',
        'expires_at',
        'is_active',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'usage_limit' => 'integer',
        'usage_count' => 'integer',
        'claim_starts_at' => 'datetime',
        'claim_ends_at' => 'datetime',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get user coupons for this coupon.
     */
    public function userCoupons(): HasMany
    {
        return $this->hasMany(UserCoupon::class);
    }

    /**
     * Check if coupon is valid and available.
     */
    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Check whether the coupon may currently be issued or claimed.
     *
     * This is independent from starts_at, which controls when an already-owned
     * coupon may be used at checkout. An already-expired coupon is never
     * issued, even if its claim period is still open.
     */
    public function isClaimable(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->claim_starts_at && $this->claim_starts_at->isFuture()) {
            return false;
        }

        if ($this->claim_ends_at && $this->claim_ends_at->isPast()) {
            return false;
        }

        // Never issue a coupon that can no longer be used. This does not make
        // the two periods the same: a coupon may still be claimed before its
        // usage period starts.
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Check if coupon is upcoming (scheduled to start in the future).
     */
    public function isUpcoming(): bool
    {
        return (bool) ($this->is_active && $this->starts_at && $this->starts_at->isFuture());
    }

    /**
     * Check if coupon is expired or inactive.
     */
    public function isExpired(): bool
    {
        return ! $this->is_active || ($this->expires_at && $this->expires_at->isPast());
    }

    /**
     * Calculate discount amount for a given order amount.
     */
    public function calculateDiscount(float $orderAmount): float
    {
        if ($orderAmount < $this->min_order_amount) {
            return 0;
        }

        if ($this->discount_type === 'percentage') {
            $discount = ($orderAmount * $this->discount_value) / 100;

            if ($this->max_discount_amount) {
                $discount = min($discount, $this->max_discount_amount);
            }

            return round(min($discount, $orderAmount), 2);
        }

        // Fixed discount
        return round(min((float) $this->discount_value, $orderAmount), 2);
    }

    /**
     * Scope a query to only include active coupons.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include valid coupons.
     */
    public function scopeValid($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereColumn('usage_count', '<', 'usage_limit');
            });
    }

    /**
     * Scope a query to coupons that may currently be issued or claimed.
     */
    public function scopeClaimable($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('claim_starts_at')
                    ->orWhere('claim_starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('claim_ends_at')
                    ->orWhere('claim_ends_at', '>=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereColumn('usage_count', '<', 'usage_limit');
            });
    }
}
