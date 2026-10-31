<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryTracking extends Model
{
    protected $fillable = [
        'order_id',
        'invoice_number',
        'waybill_registered_at',
        'delivery_status',
        'courier_name',
        'tracking_info',
    ];

    protected $casts = [
        'waybill_registered_at' => 'date',
        'delivery_status' => DeliveryStatus::class,
        'tracking_info' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @param  Builder<DeliveryTracking>  $query
     * @return Builder<DeliveryTracking>
     */
    public function scopeActive($query): Builder
    {
        return $query->where('delivery_status', '!=', DeliveryStatus::Delivered->value);
    }

    /**
     * @param  Builder<DeliveryTracking>  $query
     * @return Builder<DeliveryTracking>
     */
    public function scopeNotPolledSince($query, \DateTimeInterface $since): Builder
    {
        return $query->where(function (Builder $q) use ($since) {
            $q->whereNull('updated_at')->orWhere('updated_at', '<=', $since);
        });
    }

    /**
     * @param  Builder<DeliveryTracking>  $query
     * @return Builder<DeliveryTracking>
     */
    public function scopeWithInvoice($query): Builder
    {
        return $query->whereNotNull('invoice_number')->where('invoice_number', '!=', '');
    }

    public function isTerminal(): bool
    {
        return $this->delivery_status === DeliveryStatus::Delivered;
    }

    public function latestStatusCode(): ?string
    {
        $code = $this->tracking_info['latest_status_code'] ?? null;

        return is_string($code) ? $code : null;
    }

    public function latestStatusName(): ?string
    {
        $name = $this->tracking_info['latest_status_name'] ?? null;

        return is_string($name) ? $name : null;
    }

    public function latestStatusAt(): ?\DateTimeInterface
    {
        $raw = $this->tracking_info['latest_status_date'] ?? null;
        if (! is_string($raw) || $raw === '') {
            return null;
        }

        try {
            return \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $raw);
        } catch (\Throwable) {
            try {
                return \Carbon\Carbon::parse($raw);
            } catch (\Throwable) {
                return null;
            }
        }
    }
}
