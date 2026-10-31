<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InquiryInternalMemo extends Model
{
    use HasFactory;

    protected $table = 'inquiry_internal_memos';

    protected $fillable = [
        'inquiry_id',
        'user_id',
        'content',
    ];

    /**
     * Get the inquiry that owns the memo.
     */
    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(Inquiry::class);
    }

    /**
     * Get the user (author) of the memo.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
