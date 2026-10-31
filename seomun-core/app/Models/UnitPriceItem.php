<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class UnitPriceItem extends Model
{
    use HasFactory;

    protected $table = 'unit_price_items';

    protected $fillable = [
        'unit_price_id',
        'price_value',
        'raw_cost',
        'attributes',
        'quantity_min',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price_value' => 'integer',
        'raw_cost' => 'integer',
        'attributes' => 'array',
        'quantity_min' => 'integer',
    ];

    public function unitPrice(): BelongsTo
    {
        return $this->belongsTo(UnitPrice::class, 'unit_price_id');
    }

    public function changeLogs(): HasMany
    {
        return $this->hasMany(UnitPriceChangeLog::class);
    }
}
