<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSpecification extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'size_width_mm',
        'size_height_mm',
        'size_unit',
        'paper_type',
        'paper_weight_gsm',
        'production_time_days',
        'notes',
        'dieline_enabled',
        'dieline_margin_mm',
    ];

    protected $casts = [
        'size_width_mm' => 'decimal:2',
        'size_height_mm' => 'decimal:2',
        'paper_weight_gsm' => 'integer',
        'production_time_days' => 'integer',
        'dieline_enabled' => 'boolean',
        'dieline_margin_mm' => 'decimal:2',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
