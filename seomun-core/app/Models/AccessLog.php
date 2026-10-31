<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'login_id',
        'ip_address',
        'browser_info',
        'user_agent',
        'event_type',
        'management',
        'explanation',
        'connection_time',
        'access_date',
    ];

    protected $casts = [
        'connection_time' => 'datetime',
        'access_date' => 'date',
    ];

    /**
     * Get the user associated with this access log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to filter by login ID.
     */
    public function scopeByLoginId($query, string $loginId)
    {
        return $query->where('login_id', 'like', '%'.$loginId.'%');
    }

    /**
     * Scope a query to filter by IP address.
     */
    public function scopeByIpAddress($query, string $ipAddress)
    {
        return $query->where('ip_address', 'like', '%'.$ipAddress.'%');
    }

    /**
     * Scope a query to filter by event type.
     */
    public function scopeByEventType($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    /**
     * Scope a query to filter by access date range.
     */
    public function scopeByDateRange($query, ?string $dateFrom, ?string $dateTo)
    {
        if ($dateFrom) {
            $query->whereDate('access_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('access_date', '<=', $dateTo);
        }

        return $query;
    }

    /**
     * Scope a query to filter by browser information.
     */
    public function scopeByBrowserInfo($query, string $browserInfo)
    {
        return $query->where('browser_info', 'like', '%'.$browserInfo.'%');
    }
}
