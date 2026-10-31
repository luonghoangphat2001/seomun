<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Banner extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'image_path',
        'image_path_mobile',
        'link_url',
        'exposure_target',
        'exposure_location',
        'is_active',
        'sort_order',
        'exposure_start_date',
        'exposure_end_date',
        'created_by',
    ];

    protected $casts = [
        'exposure_target' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'exposure_start_date' => 'datetime',
        'exposure_end_date' => 'datetime',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVisible($query)
    {
        return $query
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('exposure_start_date')
                    ->orWhere('exposure_start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('exposure_end_date')
                    ->orWhere('exposure_end_date', '>=', now());
            });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'image_path',
                'image_path_mobile',
                'link_url',
                'exposure_target',
                'exposure_location',
                'is_active',
                'sort_order',
                'exposure_start_date',
                'exposure_end_date',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Banner has been {$eventName}");
    }
}
