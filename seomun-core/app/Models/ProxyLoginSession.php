<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\PersonalAccessToken;

class ProxyLoginSession extends Model
{
    protected $fillable = [
        'admin_user_id',
        'target_user_id',
        'handoff_token_hash',
        'personal_access_token_id',
        'ip_address',
        'user_agent',
        'expires_at',
        'handoff_consumed_at',
        'ended_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'handoff_consumed_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    public function token(): BelongsTo
    {
        return $this->belongsTo(PersonalAccessToken::class, 'personal_access_token_id');
    }

    public function isActive(): bool
    {
        return $this->ended_at === null && $this->expires_at->isFuture();
    }

    public function isPendingHandoff(): bool
    {
        return $this->handoff_consumed_at === null && $this->ended_at === null && $this->expires_at->isFuture();
    }
}
