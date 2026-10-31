<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSet extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity',
        'set_type',
        'min_set',
        'max_set',
        'step_set',
        'set_unit',
        'select_options',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'min_set' => 'integer',
        'max_set' => 'integer',
        'step_set' => 'integer',
        'select_options' => 'array',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
