<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InquiryAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'inquiry_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'is_reply_attachment',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Get the inquiry that owns the attachment.
     */
    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(Inquiry::class);
    }
}
