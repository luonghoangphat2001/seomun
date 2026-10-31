<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MembershipTier extends Model
{
    protected $fillable = [
        'name',
        'threshold_amount',
        'accumulation_rate',
        'has_free_shipping',
        'free_shipping_min_amount',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'threshold_amount' => 'integer',
        'accumulation_rate' => 'integer',
        'has_free_shipping' => 'boolean',
        'free_shipping_min_amount'=> 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'membership_tier_id');
    }
}
