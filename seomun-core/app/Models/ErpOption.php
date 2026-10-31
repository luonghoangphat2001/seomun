<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ErpOption extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'erp_options';

    protected $fillable = [
        'erp_option_group_id',
        'code',
        'label',
        'value',
        'additional_price',
        'osrc_um',
        'preview_image',
        'sort_order',
        'is_active',
        'size_option_id',
        'paper_id',
        'attributes',
    ];

    protected $casts = [
        'additional_price' => 'decimal:2',
        'osrc_um' => 'decimal:2',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
        'attributes' => 'array',
    ];

    public function erpOptionGroup(): BelongsTo
    {
        return $this->belongsTo(ErpOptionGroup::class, 'erp_option_group_id');
    }

    public function conditions(): HasMany
    {
        return $this->hasMany(ErpOptionCondition::class, 'option_id');
    }

    public function triggerDependencies(): HasMany
    {
        return $this->hasMany(ErpOptionDependency::class, 'trigger_option_id');
    }

    public function unitPrices(): HasMany
    {
        return $this->hasMany(UnitPrice::class, 'erp_option_id');
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class, 'paper_id');
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(SizeOption::class, 'size_option_id');
    }

    public function productOptions(): HasMany
    {
        return $this->hasMany(ProductOption::class, 'erp_option_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'erp_option_group_id',
                'code',
                'label',
                'value',
                'additional_price',
                'osrc_um',
                'preview_image',
                'sort_order',
                'is_active',
                'size_option_id',
                'paper_id',
                'attributes',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "ErpOption has been {$eventName}");
    }

    protected static function booted(): void
    {
        static::deleting(function (ErpOption $erpOption) {
            $erpOption->productOptions()->delete();
            $erpOption->conditions()->delete();
            $erpOption->triggerDependencies()->delete();
            $erpOption->paper()->delete();
            $erpOption->size()->delete();

            UnitPrice::where(function ($query) use ($erpOption) {
                $query->where('erp_size_option_id', $erpOption->id)
                    ->orWhere('erp_paper_option_id', $erpOption->id)
                    ->orWhere('erp_subject_master_option_id', $erpOption->id);
            })->get()->each(function (UnitPrice $unitPrice) {
                $unitPrice->allItems()->delete();
                $unitPrice->delete();
            });
        });
    }
}
