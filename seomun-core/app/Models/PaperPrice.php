<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class PaperPrice extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'paper_id',
        'paper_size_division_code',
        'supply_price',
        'cost',
        'is_hot_deal',
    ];

    protected $casts = [
        'paper_size_division_code' => \App\Enums\PaperSizeDivisionCode::class,
        'is_hot_deal' => 'boolean',
        'supply_price' => 'integer',
        'cost' => 'integer',
    ];

    public function paper()
    {
        return $this->belongsTo(Paper::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'paper_id',
                'paper_size_division_code',
                'supply_price',
                'cost',
                'is_hot_deal',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "PaperPrice has been {$eventName}");
    }
}
