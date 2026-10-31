<?php

namespace App\Models;

use App\Models\DesignGroup;
use App\Models\OrderArtwork;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'title',
        'quantity',
        'multiplier',
        'unit',
        'production_days',
        'unit_price',
        'total_price',
        'configuration',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'configuration' => 'array',
        'multiplier' => 'integer',
        'unit_price' => 'integer',
        'total_price' => 'integer',
        'metadata' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function designGroup(): HasOne
    {
        return $this->hasOne(DesignGroup::class);
    }

    public function artworks(): HasManyThrough
    {
        return $this->hasManyThrough(OrderArtwork::class, DesignGroup::class);
    }

    public function designWorkflow(): HasOne
    {
        return $this->hasOne(OrderItemDesignWorkflow::class);
    }
}
