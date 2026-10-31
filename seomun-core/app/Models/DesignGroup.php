<?php

namespace App\Models;

use App\Enums\DesignModeCode;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DesignGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'order_id',
        'order_item_id',
        'size_option_id',
        'title',
        'width_mm',
        'height_mm',
        'source_type',
        'preview_image_path',
        'metadata',
        'revised_file_path',
        'revised_file_name',
        'rejection_reason',
        'confirmation_requested_at',
        'confirmed_at',
        'rejected_at',
        'preview_pdf_url',
    ];

    public function sizeOption(): BelongsTo
    {
        return $this->belongsTo(SizeOption::class);
    }

    protected $casts = [
        'metadata' => 'array',
        'confirmation_requested_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'rejected_at' => 'datetime',
        'source_type' => DesignModeCode::class
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function orderArtworks(): HasMany
    {
        return $this->hasMany(OrderArtwork::class);
    }

    public function uploadArtworks(): HasMany
    {
        return $this->hasMany(UploadArtwork::class);
    }

    public function getFrontArtwork(): ?OrderArtwork
    {
        return $this->orderArtworks()->where('side', 'front')->first();
    }

    public function getBackArtwork(): ?OrderArtwork
    {
        return $this->orderArtworks()->where('side', 'back')->first();
    }
}