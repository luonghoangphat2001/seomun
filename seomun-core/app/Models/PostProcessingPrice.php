<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class PostProcessingPrice extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'code',
        'erp_option_id',
        'post_processing_size_type',
        'attributes',
        'is_active',
    ];

    protected $casts = [
        'post_processing_size_type' => \App\Enums\PostProcessingSizeType::class,
        'attributes' => 'array',
        'is_active' => 'boolean',
    ];

    public function postProcessingPriceItems()
    {
        return $this->hasMany(PostProcessingPriceItem::class);
    }

    public function erpOption(): BelongsTo
    {
        return $this->belongsTo(ErpOption::class, 'erp_option_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'code',
                'erp_option_id',
                'post_processing_size_type',
                'attributes',
                'is_active',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "PostProcessingPrice has been {$eventName}");
    }
}