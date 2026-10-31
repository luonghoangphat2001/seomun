<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ShoppingSettingItem extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'shopping_setting_id',
        'title',
        'content',
        'is_default',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the parent shopping setting.
     */
    public function setting(): BelongsTo
    {
        return $this->belongsTo(ShoppingSetting::class, 'shopping_setting_id');
    }

    /**
     * Get the products that use this shopping setting item.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_shopping_setting_items',
            'shopping_setting_item_id',
            'product_id'
        )->withPivot('shopping_setting_id')->withTimestamps();
    }

    /**
     * Scope to only active items.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to only default item.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'shopping_setting_id',
                'title',
                'content',
                'is_default',
                'is_active',
                'sort_order',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Shopping setting item has been {$eventName}");
    }
}
