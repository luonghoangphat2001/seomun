<?php

namespace App\Models;

use App\Enums\WebEditorType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class WebEditor extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'name',
        'type',
        'width',
        'height',
        'unit',
        'dpi',
        'bleed',
        'safe_area',
        'config_json',
        'is_active',
    ];

    protected $casts = [
        'width' => 'integer',
        'height' => 'integer',
        'dpi' => 'integer',
        'bleed' => 'integer',
        'safe_area' => 'integer',
        'config_json' => 'array',
        'is_active' => 'boolean',
    ];

    public function templates(): HasMany
    {
        return $this->hasMany(Template::class, 'web_editor_id');
    }
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'web_editor_id');
    }

    public function getTypeLabelAttribute(): string
    {
        return WebEditorType::labels()[$this->type] ?? $this->type;
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'type',
                'width',
                'height',
                'unit',
                'dpi',
                'bleed',
                'safe_area',
                'config_json',
                'is_active',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "WebEditor has been {$eventName}");
    }
}
