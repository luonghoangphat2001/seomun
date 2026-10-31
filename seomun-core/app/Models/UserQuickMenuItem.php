<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserQuickMenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'menu_code',
        'label',
        'label_en',
        'menu_type',
        'route',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Get the user that owns the quick menu item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
