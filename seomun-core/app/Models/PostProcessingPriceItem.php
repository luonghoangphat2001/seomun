<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostProcessingPriceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_processing_price_id',
        'quantity',
        'supply_price',
        'cost',
    ];

    public function postProcessingPrice()
    {
        return $this->belongsTo(PostProcessingPrice::class);
    }
}