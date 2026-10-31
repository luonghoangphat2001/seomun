<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pivot: product + master tier (quantity_price_tiers) + price for that product.
 */
class ProductQuantityPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity',
        'unit',
        'price',
        'currency',
        'production_days',
    ];

    protected $casts = [
        'price' => 'integer',
        'quantity' => 'integer',
        'unit' => 'string',
        'production_days' => 'integer',
    ];

    /**
     * Always load tier so accessors quantity/unit work for collections and quote logic.
     *
     * @var array<int, string>
     */
    protected $with = [];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
