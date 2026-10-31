<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'design_group_id',
        'quantity',
        'number_of_cases',
        'price',
        'options',
        'input_options',
        'notes',
        'storage_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'number_of_cases' => 'integer',
        'price' => 'integer',
        'options' => 'array',
        'storage_date' => 'datetime',
        'input_options' => 'array',
    ];

    /**
     * Get the cart that owns the item.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product for the item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function designGroup(): BelongsTo
    {
        return $this->belongsTo(DesignGroup::class);
    }
    
    /** Total sheets/copies for the line. */
    public function getTotalQuantityAttribute(): float
    {
        return (float) $this->quantity * (float) ($this->number_of_cases ?? 1);
    }

    /** The quote snapshot stores a per-case price; cases are multiplied exactly once. */
    public function getSubtotalAttribute(): float
    {
        $pricePerCase = (float) ($this->price ?? 0);
        $bundleValue = (float) ($this->number_of_cases ?? 1);

        return $pricePerCase * $bundleValue;
    }

    /**
     * OrderArtwork ids linked to this cart row (editor / upload flow).
     *
     * @return list<int>
     */
    // public function collectArtworkIds(): array
    // {
    //     $ids = [];
    //     if ($this->design_group_id) {
    //         $designGroup = DesignGroup::find($this->design_group_id);
    //         if ($designGroup) {
    //             foreach ($designGroup->orderArtworks as $artwork) {
    //                 $ids[] = (int) $artwork->id;
    //             }
    //         }
    //     }

    //     return array_values(array_unique(array_filter($ids)));
    // }
}
