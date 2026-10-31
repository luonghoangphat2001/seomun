<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class Template extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'size_option_id',
        'type',
        'orientation',
        'side',
        'specifications',
        'file_path',
        'safety_line',
        'cut_line',
        'font_set',
        'color_set',
        'spot_color',
        'layout_config',
        'editor_permission',
        'front_preview_url',
        'back_preview_url',
        'preview_images',
        'is_active',
        'created_by',
        'web_editor_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'specifications' => 'array',
        'safety_line' => 'array',
        'cut_line' => 'array',
        'font_set' => 'array',
        'color_set' => 'array',
        'spot_color' => 'array',
        'layout_config' => 'array',
        'editor_permission' => 'array',
        'front_preview_url' => 'string',
        'back_preview_url' => 'string',
        'preview_images' => 'array',
        'is_active' => 'boolean',
        'type' => \App\Enums\TemplateType::class,
        'orientation' => \App\Enums\TemplateOrientation::class,
        'side' => \App\Enums\TemplateSide::class,
    ];

    /**
     * Get the web editor for this template.
     */
    public function webEditor(): BelongsTo
    {
        return $this->belongsTo(WebEditor::class);
    }

    /**
     * Get the default size option for this template.
     */
    public function sizeOption(): BelongsTo
    {
        return $this->belongsTo(SizeOption::class, 'size_option_id');
    }

    /**
     * Get the user who created this template.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Configure activity log options.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'size_option_id',
                'type',
                'orientation',
                'side',
                'specifications',
                'file_path',
                'safety_line',
                'cut_line',
                'font_set',
                'color_set',
                'spot_color',
                'layout_config',
                'editor_permission',
                'front_preview_url',
                'back_preview_url',
                'preview_images',
                'is_active',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Template has been {$eventName}");
    }

    public function tapActivity(Activity $activity): void
    {
        // We can extend later to include custom metadata such as reason or actor.
    }
}
