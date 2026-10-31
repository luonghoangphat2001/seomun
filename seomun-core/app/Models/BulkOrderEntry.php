<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BulkOrderEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'row_number',
        'data',
        'status',
        'error_message',
        'order_artwork_id',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(BulkOrderBatch::class, 'batch_id');
    }

    public function artwork(): BelongsTo
    {
        return $this->belongsTo(OrderArtwork::class, 'order_artwork_id');
    }
}
