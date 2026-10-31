<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Order;
use App\Models\User;

class OrderStatusChangeHistory extends Model
{
    protected $fillable = [
        'order_id',
        'change_at',
        'old_status',
        'new_status',
        'changed_by',
        'note',
    ];

    protected $casts = [
        'change_at' => 'datetime',
    ];

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
