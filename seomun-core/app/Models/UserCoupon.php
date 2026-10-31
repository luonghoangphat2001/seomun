<?php

namespace App\Models;

use App\Enums\UserCouponStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCoupon extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'coupon_id',
        'received_at',
        'used_at',
        'order_id',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => UserCouponStatus::class,
        'received_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    /**
     * Get the user that owns this coupon.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the coupon.
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Get the order where this coupon was used.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Check if coupon is available for use.
     */
    public function isAvailable(): bool
    {
        return $this->getActualStatus() === UserCouponStatus::AVAILABLE
            && (bool) $this->coupon?->isValid();
    }

    /**
     * Mark coupon as used.
     */
    public function markAsUsed(int $orderId): void
    {
        $this->update([
            'status' => UserCouponStatus::USED,
            'used_at' => now(),
            'order_id' => $orderId,
        ]);

        // Increment coupon usage count
        $this->coupon?->increment('usage_count');
    }

    /**
     * Rollback coupon when order is cancelled or fully refunded.
     */
    public function rollback(): void
    {
        if ($this->status !== UserCouponStatus::USED) {
            return;
        }

        $isExpired = ! $this->coupon || ! $this->coupon->is_active || ($this->coupon->expires_at && $this->coupon->expires_at->isPast());
        $isUpcoming = ! $isExpired && $this->coupon && $this->coupon->starts_at && $this->coupon->starts_at->isFuture();

        $status = $isExpired
            ? UserCouponStatus::EXPIRED
            : ($isUpcoming ? UserCouponStatus::UPCOMING : UserCouponStatus::AVAILABLE);

        $this->update([
            'status' => $status,
            'used_at' => null,
            'order_id' => null,
        ]);

        if ($this->coupon && $this->coupon->usage_count > 0) {
            $this->coupon->decrement('usage_count');
        }
    }

    /**
     * Check if coupon is expired.
     */
    public function isExpired(): bool
    {
        if ($this->status === UserCouponStatus::USED) {
            return false;
        }

        if ($this->status === UserCouponStatus::EXPIRED) {
            return true;
        }

        if (! $this->coupon) {
            return true;
        }

        return ! $this->coupon->is_active || ($this->coupon->expires_at && $this->coupon->expires_at->isPast());
    }

    /**
     * Check if coupon is upcoming (scheduled to start in the future).
     */
    public function isUpcoming(): bool
    {
        if ($this->status === UserCouponStatus::USED || $this->isExpired()) {
            return false;
        }

        return (bool) ($this->coupon
            && $this->coupon->is_active
            && $this->coupon->starts_at
            && $this->coupon->starts_at->isFuture());
    }

    /**
     * Get the real/actual status of the user coupon.
     */
    public function getActualStatus(): UserCouponStatus
    {
        if ($this->status === UserCouponStatus::USED) {
            return UserCouponStatus::USED;
        }

        if ($this->isExpired()) {
            return UserCouponStatus::EXPIRED;
        }

        if ($this->isUpcoming()) {
            return UserCouponStatus::UPCOMING;
        }

        return UserCouponStatus::AVAILABLE;
    }

    /**
     * Scope a query to filter by user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatus($query, UserCouponStatus|string $status)
    {
        return $query->where('status', $status instanceof UserCouponStatus ? $status->value : $status);
    }

    /**
     * Scope a query to get available coupons.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', '!=', UserCouponStatus::USED->value)
            ->whereIn('status', [UserCouponStatus::AVAILABLE->value, UserCouponStatus::UPCOMING->value])
            ->whereHas('coupon', function ($q) {
                $q->valid();
            });
    }

    /**
     * Scope a query to get expired coupons.
     */
    public function scopeExpired($query)
    {
        return $query->where('status', '!=', UserCouponStatus::USED->value)
            ->where(function ($q) {
                $q->where('status', UserCouponStatus::EXPIRED->value)
                    ->orWhere(function ($sub) {
                        $sub->whereIn('status', [UserCouponStatus::AVAILABLE->value, UserCouponStatus::UPCOMING->value])
                            ->where(function ($invalid) {
                                $invalid->whereHas('coupon', function ($cq) {
                                    $cq->where(function ($exp) {
                                        $exp->whereNotNull('expires_at')
                                            ->where('expires_at', '<=', now());
                                    })->orWhere('is_active', false);
                                })->orWhereDoesntHave('coupon');
                            });
                    });
            });
    }

    /**
     * Scope a query to get upcoming coupons.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', '!=', UserCouponStatus::USED->value)
            ->whereIn('status', [UserCouponStatus::AVAILABLE->value, UserCouponStatus::UPCOMING->value])
            ->whereHas('coupon', function ($cq) {
                $cq->where('is_active', true)
                    ->whereNotNull('starts_at')
                    ->where('starts_at', '>', now())
                    ->where(function ($exp) {
                        $exp->whereNull('expires_at')
                            ->orWhere('expires_at', '>', now());
                    });
            });
    }

    /**
     * Scope a query to get used coupons.
     */
    public function scopeUsed($query)
    {
        return $query->where('status', UserCouponStatus::USED->value);
    }
}
