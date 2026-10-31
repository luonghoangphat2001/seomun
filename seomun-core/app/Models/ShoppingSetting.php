<?php

namespace App\Models;

use App\Enums\ShoppingSettingType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ShoppingSetting extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'title',
        'content',
        'type',
    ];

    protected $casts = [
        'type' => ShoppingSettingType::class,
    ];

    /**
     * Get all items belonging to this shopping setting.
     */
    public function items(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ShoppingSettingItem::class, 'shopping_setting_id')->orderBy('sort_order');
    }

    /**
     * Get active items belonging to this shopping setting.
     */
    public function activeItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ShoppingSettingItem::class, 'shopping_setting_id')
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    /**
     * Get default item for this shopping setting.
     */
    public function defaultItem(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ShoppingSettingItem::class, 'shopping_setting_id')
            ->where('is_default', true);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'title',
                'content',
                'type',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Shopping setting has been {$eventName}");
    }
}