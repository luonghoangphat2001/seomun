<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuantityPriceTier extends Model
{
    use HasFactory;

    protected $table = 'quantity_price_tiers';

    protected $fillable = [
        'quantity',
        'unit',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Pivot rows: per-product price for this tier.
     */
    public function productQuantityPrices(): HasMany
    {
        return $this->hasMany(ProductQuantityPrice::class, 'quantity_price_tier_id');
    }
}
