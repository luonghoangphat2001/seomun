<?php

namespace App\Models;

use App\Enums\OrderExtraEntryInputType;
use App\Enums\OrderExtraEntryStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class OrderExtraEntry extends Model
{
    protected $fillable = [
        'status',
        'is_required',
        'label',
        'input_type',
        'input_options',
    ];

    protected $casts = [
        'status' => OrderExtraEntryStatus::class,
        'input_type' => OrderExtraEntryInputType::class,
        'is_required' => 'boolean',
        'input_options' => 'array',
    ];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'order_extra_entry_products'
        );
    }

    /* Helpers */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
