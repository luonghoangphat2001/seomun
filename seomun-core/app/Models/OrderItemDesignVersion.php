<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItemDesignVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_item_design_workflow_id',
        'version',
        'file_path',
        'file_name',
        'designer_note',
        'submitted_by_user_id',
        'customer_response',
        'customer_note',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
        ];
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(OrderItemDesignWorkflow::class, 'order_item_design_workflow_id');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id');
    }
}
