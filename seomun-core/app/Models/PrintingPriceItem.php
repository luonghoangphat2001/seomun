<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrintingPriceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'printing_price_id',
        'quantity',
        'supply_price',
        'cost',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'supply_price' => 'integer',
        'cost' => 'integer',
    ];

    public function printingPrice()
    {
        return $this->belongsTo(PrintingPrice::class);
    }
}