<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Approval extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'approvable_type',
        'approvable_id',
        'requested_by',
        'status',
        'current_stage',
        'total_stages',
        'approval_flow',
        'request_reason',
        'reject_reason',
        'requested_at',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'approval_flow' => 'array',
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'current_stage' => 'integer',
        'total_stages' => 'integer',
    ];

    /**
     * Get the parent approvable model (Order, etc.)
     */
    public function approvable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who requested approval
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get approval items (stages)
     */
    public function items(): HasMany
    {
        return $this->hasMany(ApprovalItem::class)->orderBy('stage');
    }

    /**
     * Check if approval is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if approval is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if approval is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Get current approval item
     */
    public function currentItem(): ?ApprovalItem
    {
        return $this->items()
            ->where('stage', $this->current_stage)
            ->where('status', 'pending')
            ->first();
    }
}
