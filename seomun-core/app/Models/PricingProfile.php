<?php

namespace App\Models;

use App\Enums\PricingCalculatorType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PricingProfile extends Model
{
    protected $fillable = ['code', 'name', 'calculator_type', 'settings', 'is_active'];

    protected $casts = [
        'calculator_type' => PricingCalculatorType::class,
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function products(): HasMany { return $this->hasMany(Product::class); }
}
