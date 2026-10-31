<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BundleTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'bundle_value',
        'label',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'bundle_value' => 'decimal:2',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function productQuantityPrices(): HasMany
    {
        return $this->hasMany(ProductQuantityPrice::class, 'bundle_tier_id');
    }
}
