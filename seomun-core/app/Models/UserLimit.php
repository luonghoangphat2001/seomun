<?php

namespace App\Models;

use App\Enums\UserLimitStatus;
use App\Http\Filters\Admin\UserLimitFilter;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class UserLimit extends Model
{
    use Filterable, LogsActivity, SoftDeletes;

    protected $fillable = [
        'user_id',
        'limit',
        'usage_amount',
        'remaining_amount',
        'status',
    ];

    protected $casts = [
        'status' => UserLimitStatus::class,
    ];

    public ?string $logReason = null;

    public ?string $logBatchId = null;

    /**
     * Get activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnlyDirty()
            ->logOnly(['user_id', 'limit', 'usage_amount', 'remaining_amount', 'status'])
            ->dontSubmitEmptyLogs()
            ->useLogName('user_limit')
            ->setDescriptionForEvent(fn (string $eventName) => "User limit has been {$eventName}");
    }

    /**
     * Get activity log
     */
    public function tapActivity(Activity $activity): void
    {
        if ($this->logReason) {
            $activity->properties = [...$activity->properties, 'reason' => $this->logReason];
        }

        if ($this->logBatchId) {
            $activity->batch_uuid = $this->logBatchId;
            $activity->properties = [...$activity->properties, 'batch_id' => $this->logBatchId];
        }
    }

    /**
     * Get filters class
     */
    protected function getFiltersClass(): string
    {
        return UserLimitFilter::class;
    }

    /**
     * Get user
     *
     * @return BelongsTo<User, UserLimit>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get limit usaged logs
     *
     * @return HasMany<LimitUsagedLogs, UserLimit>
     */
    public function limitUsagedLogs(): HasMany
    {
        return $this->hasMany(LimitUsagedLogs::class);
    }
}
