<?php

namespace App\Models;

use App\Enums\OrderItemDesignWorkflowStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderItemDesignWorkflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'order_item_id',
        'design_mode_code',
        'status',
        'assigned_designer_id',
        'assigned_by_user_id',
        'final_file_path',
        'final_file_name',
        'finalized_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderItemDesignWorkflowStatus::class,
            'finalized_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function assignedDesigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_designer_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by_user_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(OrderItemDesignVersion::class)->orderBy('version');
    }

    /** Most recently submitted draft, used by the designer's work queue. */
    public function latestVersion(): HasOne
    {
        return $this->hasOne(OrderItemDesignVersion::class)->ofMany('version', 'max');
    }
}
