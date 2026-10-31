<?php

namespace App\Models;

use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionGroupType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ErpOptionGroup extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'erp_option_groups';

    protected $fillable = [
        'code',
        'label',
        'type',
        'display_type',
        'is_required',
        'sort_order',
    ];

    protected $casts = [
        'code' => ErpOptionGroupCode::class,
        'is_required' => 'boolean',
        'sort_order' => 'integer',
        'type' => ErpOptionGroupType::class,
    ];

    public function erpOptions(): HasMany
    {
        return $this->hasMany(ErpOption::class, 'erp_option_group_id')
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    public function productOptionGroups(): HasMany
    {
        return $this->hasMany(ProductOptionGroup::class, 'erp_option_group_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'code',
                'label',
                'type',
                'display_type',
                'is_required',
                'sort_order',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "ErpOptionGroup has been {$eventName}");
    }
}
